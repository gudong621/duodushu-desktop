"""
添加查询次数跟踪和智能优先级字段
"""

import sqlite3
import sys
import io
from pathlib import Path

# 设置 UTF-8 编码输出
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 数据库路径
DB_PATH = Path(__file__).parent.parent / "data" / "app.db"

def migrate():
    """执行数据库迁移"""
    print("🔧 开始数据库迁移...")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 1. 添加 query_count 字段
        print("\n1. 添加字段: query_count")
        try:
            cursor.execute(
                "ALTER TABLE vocabulary ADD COLUMN query_count INTEGER DEFAULT 0"
            )
            print("   ✅ query_count 字段已添加")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("   ⚠️  query_count 字段已存在，跳过")
            else:
                print(f"   ❌ 添加 query_count 失败: {e}")
                raise
        
        # 2. 添加 last_queried_at 字段
        print("\n2. 添加字段: last_queried_at")
        try:
            cursor.execute(
                "ALTER TABLE vocabulary ADD COLUMN last_queried_at TIMESTAMP"
            )
            print("   ✅ last_queried_at 字段已添加")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("   ⚠️  last_queried_at 字段已存在，跳过")
            else:
                print(f"   ❌ 添加 last_queried_at 失败: {e}")
                raise
        
        # 3. 添加 priority_score 字段
        print("\n3. 添加字段: priority_score")
        try:
            cursor.execute(
                "ALTER TABLE vocabulary ADD COLUMN priority_score REAL DEFAULT 0"
            )
            print("   ✅ priority_score 字段已添加")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("   ⚠️  priority_score 字段已存在，跳过")
            else:
                print(f"   ❌ 添加 priority_score 失败: {e}")
                raise
        
        # 4. 添加 learning_status 字段
        print("\n4. 添加字段: learning_status")
        try:
            cursor.execute(
                "ALTER TABLE vocabulary ADD COLUMN learning_status VARCHAR(20) DEFAULT 'new'"
            )
            print("   ✅ learning_status 字段已添加")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("   ⚠️  learning_status 字段已存在，跳过")
            else:
                print(f"   ❌ 添加 learning_status 失败: {e}")
                raise
        
        # 提交更改
        conn.commit()
        print("\n✅ 数据库迁移完成！")
        
    except Exception as e:
        print(f"\n❌ 迁移失败: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
