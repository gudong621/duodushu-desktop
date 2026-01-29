"""
简单测试端点：验证代码是否真的在执行
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..models.database import get_db
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/test", tags=["test"])


@router.get("/ping")
def test_ping():
    """测试端点"""
    print("[TEST] Test endpoint called!")
    logger.info("[TEST] Test endpoint logged via logger.info")
    return {"status": "ok", "message": "Backend is running"}


@router.get("/db-check")
def test_db(db: Session = Depends(get_db)):
    """测试数据库连接"""
    try:
        result = db.execute(text("SELECT COUNT(*) FROM vocabulary"))
        row = result.fetchone()
        count = row[0] if row else 0  # type: ignore
        print(f"[TEST] Vocabulary count: {count}")
        logger.info(f"[TEST] Database query successful, count: {count}")

        # 检查 word_contexts 表
        result = db.execute(text("SELECT COUNT(*) FROM word_contexts"))
        row = result.fetchone()
        context_count = row[0] if row else 0  # type: ignore
        print(f"[TEST] Word contexts count: {context_count}")
        logger.info(f"[TEST] Word contexts count: {context_count}")

        # 检查例句库例句
        result = db.execute(
            text("""
            SELECT COUNT(*) FROM word_contexts WHERE source_type = 'example_library'
        """)
        )
        row = result.fetchone()
        example_count = row[0] if row else 0  # type: ignore
        print(f"[TEST] Example library contexts: {example_count}")
        logger.info(f"[TEST] Example library contexts: {example_count}")

        return {
            "status": "ok",
            "vocabulary_count": count,
            "word_contexts_count": context_count,
            "example_library_count": example_count,
        }
    except Exception as e:
        print(f"[TEST] Database error: {e}")
        logger.error(f"[TEST] Database error: {e}")
        return {"status": "error", "message": str(e)}


@router.get("/version")
def test_version():
    """测试代码版本"""
    print("[TEST] Version check - printing to console")
    logger.info("[TEST] Version check - logging via logger.info")
    return {
        "status": "ok",
        "version": "1.0",
        "message": "Direct execution (no BackgroundTasks)",
    }
