"""
FTS5 全文搜索迁移

为 pages 表添加 FTS5 虚拟表，提升搜索性能：
1. 创建 pages_fts 虚拟表
2. 实现自动同步触发器（INSERT, UPDATE, DELETE）
3. 同步现有数据
"""

import sqlite3
import os
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# 获取数据库路径（与 database.py 保持一致）
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "data" / "app.db"


def migrate_fts5():
    """
    执行 FTS5 迁移
    """
    if not DB_PATH.exists():
        logger.error(f"Database not found at {DB_PATH}")
        return False

    conn = None
    try:
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()

        logger.info("Starting FTS5 migration...")

        # 1. 检查 FTS5 是否可用
        cursor.execute("SELECT sqlite_version();")
        version = cursor.fetchone()[0]
        logger.info(f"SQLite version: {version}")

        # SQLite 3.9+ 支持 FTS5
        # 检查 FTS5 是否可用
        try:
            cursor.execute("CREATE VIRTUAL TABLE IF NOT EXISTS test_fts USING fts5(t);")
            cursor.execute("DROP TABLE IF EXISTS test_fts;")
            logger.info("FTS5 is available")
        except sqlite3.OperationalError as e:
            if "no such module: fts5" in str(e):
                logger.error(
                    "FTS5 module not available. Please install/load FTS5 extension."
                )
                return False
            raise

        # 2. 创建 pages_fts 虚拟表
        logger.info("Creating pages_fts virtual table...")
        cursor.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS pages_fts USING fts5(
                id UNINDEXED,
                book_id UNINDEXED,
                page_number UNINDEXED,
                text_content,
                content='pages',
                content_rowid='id'
            );
        """)
        logger.info("pages_fts table created")

        # 3. 同步现有数据
        logger.info("Syncing existing data to pages_fts...")
        # FTS5 不支持 ON CONFLICT，使用 INSERT OR REPLACE
        cursor.execute("""
            INSERT OR REPLACE INTO pages_fts(id, book_id, page_number, text_content)
            SELECT id, book_id, page_number, text_content
            FROM pages
            WHERE text_content IS NOT NULL;
        """)

        sync_count = cursor.rowcount
        logger.info(f"Synced {sync_count} existing pages")

        # 4. 创建自动同步触发器
        logger.info("Creating triggers for auto-sync...")

        # INSERT 触发器
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS pages_ai AFTER INSERT ON pages BEGIN
                INSERT INTO pages_fts(id, book_id, page_number, text_content)
                VALUES (NEW.id, NEW.book_id, NEW.page_number, NEW.text_content);
            END;
        """)
        logger.info("INSERT trigger created")

        # UPDATE 触发器
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS pages_au AFTER UPDATE ON pages BEGIN
                INSERT INTO pages_fts(id, book_id, page_number, text_content)
                VALUES (NEW.id, NEW.book_id, NEW.page_number, NEW.text_content);
            END;
        """)
        logger.info("UPDATE trigger created")

        # DELETE 触发器
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS pages_ad AFTER DELETE ON pages BEGIN
                INSERT INTO pages_fts(pages_fts, id) VALUES('delete', OLD.id);
            END;
        """)
        logger.info("DELETE trigger created")

        # 提交所有更改
        conn.commit()

        logger.info("FTS5 migration completed successfully")
        return True

    except Exception as e:
        logger.error(f"Error during FTS5 migration: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            conn.close()


def verify_fts5():
    """
    验证 FTS5 是否正常工作
    """
    if not DB_PATH.exists():
        return False

    conn = None
    try:
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()

        # 检查 pages_fts 表是否存在
        cursor.execute("""
            SELECT name FROM sqlite_master
            WHERE type='table' AND name='pages_fts';
        """)
        if not cursor.fetchone():
            logger.warning("pages_fts table not found")
            return False

        # 检查触发器是否存在
        cursor.execute("""
            SELECT name FROM sqlite_master
            WHERE type='trigger' AND name LIKE 'pages_%';
        """)
        triggers = cursor.fetchall()
        if len(triggers) < 3:
            logger.warning(f"Expected 3 triggers, found {len(triggers)}")
            return False

        # 测试搜索功能
        cursor.execute("""
            SELECT count(*) FROM pages_fts
        """)
        count = cursor.fetchone()[0]
        logger.info(f"FTS5 index contains {count} pages")

        return True

    except Exception as e:
        logger.error(f"Error verifying FTS5: {e}")
        return False
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

    logger.info("=" * 60)
    logger.info("FTS5 Migration Script")
    logger.info("=" * 60)

    # 执行迁移
    success = migrate_fts5()

    if success:
        logger.info("Migration successful. Verifying...")
        if verify_fts5():
            logger.info("✓ FTS5 verification passed")
        else:
            logger.error("✗ FTS5 verification failed")
    else:
        logger.error("✗ Migration failed")

    logger.info("=" * 60)
