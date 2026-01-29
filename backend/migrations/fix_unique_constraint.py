"""
数据库迁移：修改 word_contexts 表的唯一约束
解决：同一页可以同时保存 user_collected 和 example_library 两种例句

原因：
- 原约束 UNIQUE(word, book_id, page_number) 导致同页只能有一条记录
- 当用户收藏单词后，后台任务尝试在同一页提取 example_library 例句时会冲突

新约束：
- UNIQUE(word, book_id, page_number, source_type)
- 允许同一页有不同类型的例句

运行方式：
    python migrations/fix_unique_constraint.py
"""

import sqlite3
import sys
import os
import io
from pathlib import Path

# 设置 UTF-8 编码输出（Windows 兼容）
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# 数据库路径
DB_PATH = Path(__file__).parent.parent / "data" / "app.db"


def check_current_constraint():
    """检查当前约束情况"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # 获取表结构
        cursor.execute(
            "SELECT sql FROM sqlite_master WHERE type='table' AND name='word_contexts'"
        )
        result = cursor.fetchone()
        if not result:
            print("[ERROR] 错误：word_contexts 表不存在")
            return False

        table_sql = result[0]
        print("=== 当前 word_contexts 表结构 ===")
        print(table_sql)
        print()

        # 检查唯一约束
        has_old_constraint = "UNIQUE(word, book_id, page_number)" in table_sql
        has_new_constraint = (
            "UNIQUE(word, book_id, page_number, source_type)" in table_sql
        )

        if has_new_constraint:
            print("[OK] 新唯一约束已存在，无需迁移")
            return False
        elif has_old_constraint:
            print("[INFO] 发现旧唯一约束，需要迁移")
            return True
        else:
            print("[WARN] 未找到唯一约束，可能已手动修改")
            return False

    finally:
        conn.close()


def migrate():
    """执行迁移"""
    print("开始迁移 word_contexts 表唯一约束...\n")

    # 检查是否需要迁移
    if not check_current_constraint():
        print("迁移完成（无需操作）")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        print("\n=== 步骤 1/5: 备份现有数据 ===")
        # 创建备份表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS word_contexts_backup AS
            SELECT * FROM word_contexts
        """)
        backup_count = cursor.execute(
            "SELECT COUNT(*) FROM word_contexts_backup"
        ).fetchone()[0]
        print(f"✓ 已备份 {backup_count} 条记录到 word_contexts_backup")

        print("\n=== 步骤 2/5: 获取数据统计 ===")
        # 统计数据
        stats = cursor.execute("""
            SELECT
                COUNT(*) as total,
                COUNT(DISTINCT word) as unique_words,
                COUNT(DISTINCT book_id) as unique_books
            FROM word_contexts
        """).fetchone()
        print(f"  总记录数: {stats[0]}")
        print(f"  单词数: {stats[1]}")
        print(f"  书籍数: {stats[2]}")

        # 检查潜在的冲突记录
        conflicts = cursor.execute("""
            SELECT word, book_id, page_number, COUNT(*) as cnt
            FROM word_contexts
            GROUP BY word, book_id, page_number
            HAVING cnt > 1
            LIMIT 10
        """).fetchall()

        if conflicts:
            print(f"\n  [WARN] 发现 {len(conflicts)} 个潜在的冲突（同页多条记录）：")
            for c in conflicts[:5]:
                print(f"    - {c[0]} | book={c[1][:8]}... | page={c[2]} | count={c[3]}")

        print("\n=== 步骤 3/5: 重命名旧表 ===")
        # 重命名旧表
        cursor.execute("ALTER TABLE word_contexts RENAME TO word_contexts_old")
        print("✓ 已重命名为 word_contexts_old")

        print("\n=== 步骤 4/5: 创建新表（修改后的约束）===")
        # 创建新表，使用新的唯一约束
        cursor.execute("""
            CREATE TABLE word_contexts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word TEXT NOT NULL,
                book_id TEXT NOT NULL,
                page_number INTEGER NOT NULL,
                context_sentence TEXT NOT NULL,
                is_primary BOOLEAN DEFAULT 0,
                source_type TEXT DEFAULT 'user_collected',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (book_id) REFERENCES books(id),
                UNIQUE(word, book_id, page_number, source_type)
            )
        """)
        print("✓ 已创建新表，唯一约束: UNIQUE(word, book_id, page_number, source_type)")

        print("\n=== 步骤 5/5: 迁移数据并重建索引 ===")
        # 迁移数据
        cursor.execute("""
            INSERT INTO word_contexts (id, word, book_id, page_number, context_sentence, is_primary, source_type, created_at)
            SELECT id, word, book_id, page_number, context_sentence, is_primary, source_type, created_at
            FROM word_contexts_old
        """)
        migrated_count = cursor.rowcount
        print(f"✓ 已迁移 {migrated_count} 条记录")

        # 重建索引
        cursor.execute("DROP INDEX IF EXISTS idx_word_contexts_word")
        cursor.execute("DROP INDEX IF EXISTS idx_word_contexts_book")

        cursor.execute("CREATE INDEX idx_word_contexts_word ON word_contexts(word)")
        cursor.execute("CREATE INDEX idx_word_contexts_book ON word_contexts(book_id)")
        print("✓ 已重建索引")

        # 提交事务
        conn.commit()
        print("\n[OK] 迁移成功完成！")
        print("\n迁移摘要：")
        print("  • 旧约束: UNIQUE(word, book_id, page_number)")
        print("  • 新约束: UNIQUE(word, book_id, page_number, source_type)")
        print("  • 备份表: word_contexts_backup（保留7天）")
        print("  • 旧表: word_contexts_old（需要手动删除）")
        print("\n效果：")
        print("  [OK] 同一页可以有 user_collected 和 example_library 两种例句")
        print("  [OK] 避免唯一约束冲突")
        print("  [OK] 后台例句提取任务不再失败")

        print("\n后续操作：")
        print("  1. 验证功能正常后，运行: DROP TABLE word_contexts_old;")
        print("  2. 7天后运行: DROP TABLE word_contexts_backup;")

    except Exception as e:
        print(f"\n[ERROR] 迁移失败: {e}")
        import traceback

        traceback.print_exc()
        conn.rollback()
        sys.exit(1)

    finally:
        conn.close()


def verify_migration():
    """验证迁移结果"""
    print("\n=== 验证迁移结果 ===")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # 检查表结构
        cursor.execute(
            "SELECT sql FROM sqlite_master WHERE type='table' AND name='word_contexts'"
        )
        table_sql = cursor.fetchone()[0]

        if "UNIQUE(word, book_id, page_number, source_type)" in table_sql:
            print("[OK] 新唯一约束已应用")
        else:
            print("[ERROR] 新唯一约束未找到")
            return False

        # 检查数据完整性
        cursor.execute("SELECT COUNT(*) FROM word_contexts")
        count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM word_contexts_backup")
        backup_count = cursor.fetchone()[0]

        if count == backup_count:
            print(f"[OK] 数据完整 ({count} 条记录)")
        else:
            print(f"[WARN] 数据数量不一致: 新表={count}, 备份={backup_count}")

        # 检查索引
        cursor.execute("PRAGMA index_list(word_contexts)")
        indexes = cursor.fetchall()
        print(f"[OK] 索引正常 ({len(indexes)} 个)")

        return True

    finally:
        conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("  word_contexts 唯一约束迁移工具")
    print("=" * 60)
    print()

    # 执行迁移
    migrate()

    # 验证
    verify_migration()

    print()
    print("=" * 60)
