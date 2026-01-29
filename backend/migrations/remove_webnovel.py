"""
数据库迁移：移除 webnovel 分类，简化为 'normal' 和 'example_library'
并添加 source_type 字段到 word_contexts 表
"""

import sqlite3
import os
import sys
import io

# Set UTF-8 output for Windows
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")


def migrate():
    db_path = os.path.join(os.path.dirname(__file__), "..", "data", "app.db")

    if not os.path.exists(db_path):
        print(f"Database not found: {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        print("Starting database migration...")

        # 1. Check and add book_type column
        print("\n1. Checking book_type column...")
        cursor.execute("PRAGMA table_info(books)")
        columns = [row[1] for row in cursor.fetchall()]

        if "book_type" not in columns:
            print("   Adding book_type column to books table...")
            cursor.execute(
                "ALTER TABLE books ADD COLUMN book_type TEXT DEFAULT 'normal'"
            )
            print("   [OK] book_type column added")
        else:
            print("   book_type column already exists")

            # Clean up webnovel data: convert all webnovel to normal
            cursor.execute("SELECT COUNT(*) FROM books WHERE book_type = 'webnovel'")
            webnovel_count = cursor.fetchone()[0]

            if webnovel_count > 0:
                print(f"   Converting {webnovel_count} webnovel books to normal...")
                cursor.execute(
                    "UPDATE books SET book_type = 'normal' WHERE book_type = 'webnovel'"
                )
                print("   [OK] Webnovel books converted")
            else:
                print("   No webnovel books to convert")

        # 2. Check and add source_type column
        print("\n2. Checking source_type column...")
        cursor.execute("PRAGMA table_info(word_contexts)")
        columns = [row[1] for row in cursor.fetchall()]

        if "source_type" not in columns:
            print("   Adding source_type column to word_contexts table...")
            cursor.execute(
                "ALTER TABLE word_contexts ADD COLUMN source_type TEXT DEFAULT 'user_collected'"
            )
            print("   [OK] source_type column added")

            # Clean up and re-mark
            cursor.execute(
                "UPDATE word_contexts SET source_type = 'example_library' WHERE is_primary = 0"
            )
            print("   [OK] Marked extra examples as 'example_library'")

            cursor.execute(
                "UPDATE word_contexts SET source_type = 'user_collected' WHERE is_primary = 1"
            )
            print("   [OK] Marked primary contexts as 'user_collected'")
        else:
            print("   source_type column already exists")

        # 3. Commit changes
        conn.commit()
        print("\n[SUCCESS] Database migration completed!")
        print("\nMigration summary:")
        print("  • book_type: 'normal' (default) | 'example_library'")
        print("  • source_type: 'user_collected' (default) | 'example_library'")
        print("  • All webnovel books converted to normal")

    except Exception as e:
        print(f"\n[ERROR] Migration failed: {e}")
        conn.rollback()
        import traceback

        traceback.print_exc()
    finally:
        conn.close()


if __name__ == "__main__":
    migrate()
