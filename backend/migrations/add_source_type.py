"""
数据库迁移：添加 source_type 字段到 word_contexts 表
用于区分上下文来源：
- 'user_collected': 用户在阅读中主动收藏的上下文
- 'example_library': 从例句库书籍中自动提取的上下文
"""

import sqlite3
import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def migrate():
    """执行迁移"""
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "app.db")

    if not os.path.exists(db_path):
        print(f"Database not found at: {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # 检查字段是否存在
        cursor.execute("PRAGMA table_info(word_contexts)")
        columns = [row[1] for row in cursor.fetchall()]

        if "source_type" not in columns:
            print("Adding source_type column to word_contexts...")

            # 添加 source_type 字段
            cursor.execute("""
                ALTER TABLE word_contexts
                ADD COLUMN source_type TEXT DEFAULT 'user_collected'
            """)

            # 将现有的 is_primary=0 的记录标记为例句库上下文
            cursor.execute("""
                UPDATE word_contexts
                SET source_type = 'example_library'
                WHERE is_primary = 0
            """)

            conn.commit()
            print("Migration completed successfully!")
            print("  - Added source_type column")
            print("  - Marked existing is_primary=0 records as 'example_library'")
            print("  - Marked existing is_primary=1 records as 'user_collected'")
        else:
            print("source_type column already exists, skipping migration")

    except Exception as e:
        print(f"Migration error: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    migrate()
