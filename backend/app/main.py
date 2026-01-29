from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routers import (
    books,
    dictionary,
    tts,
    vocabulary,
    bookmarks,
    ai,
    rag,
    dicts,
    test as test_router,
)
from app.models import models
from .models.database import engine, SessionLocal
from app.config import BASE_DIR
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import atexit
import os
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()],
    force=True,  # 强制重新配置
)

logger = logging.getLogger(__name__)

# 创建后台调度器
# 创建后台调度器
scheduler = BackgroundScheduler()

def scheduled_priority_update():
    """每天凌晨3点更新所有单词优先级"""
    logger.info(f"🕒 [{datetime.utcnow()}] 开始定时更新单词优先级...")

    db = SessionLocal()
    try:
        from .routers.vocabulary import update_all_priorities

        result = update_all_priorities(db)
        logger.info(f"✅ 定时更新完成: {result}")
    except Exception as e:
        logger.error(f"❌ 定时更新失败: {e}", exc_info=True)
    finally:
        db.close()

# 添加定时任务：每天凌晨3点
scheduler.add_job(scheduled_priority_update, "cron", hour=3, minute=0, id="daily_priority_update")

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database and start scheduler
    # 创建数据库表并迁移
    logger.info("初始化数据库...")
    try:
        models.Base.metadata.create_all(bind=engine)
        logger.info("数据库表创建完成")

        # 迁移：添加新列到现有表
        from sqlalchemy import inspect, text
        inspector = inspect(engine)

        # 检查 vocabulary 表是否有缺失的列
        with engine.connect() as conn:
            existing_columns = [col['name'] for col in inspector.get_columns('vocabulary')]
            new_columns = {
                'query_count': 'ALTER TABLE vocabulary ADD COLUMN query_count INTEGER DEFAULT 0',
                'last_queried_at': 'ALTER TABLE vocabulary ADD COLUMN last_queried_at TIMESTAMP',
                'priority_score': 'ALTER TABLE vocabulary ADD COLUMN priority_score REAL DEFAULT 0.0',
                'learning_status': 'ALTER TABLE vocabulary ADD COLUMN learning_status VARCHAR DEFAULT "new"',
            }

            for col_name, alter_sql in new_columns.items():
                if col_name not in existing_columns:
                    try:
                        conn.execute(text(alter_sql))
                        conn.commit()
                        logger.info(f"已添加列: vocabulary.{col_name}")
                    except Exception as e:
                        logger.warning(f"添加列 {col_name} 失败（可能已存在）: {e}")

    except Exception as e:
        logger.error(f"数据库初始化失败: {e}")

    # 启动调度器
    logger.info("启动后台任务调度器...")
    try:
        scheduler.start()
    except Exception as e:
        logger.warning(f"调度器启动警告: {e}")
    yield
    # Shutdown: Stop scheduler
    logger.info("关闭后台任务调度器...")
    if scheduler.running:
        scheduler.shutdown()

app = FastAPI(title="多读书 - duodushu API", lifespan=lifespan)

# 允许跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "app://.",             # Allow specific app origin
        "app://duodushu-desktop", # Allow specific app origin
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(books.router)
app.include_router(dictionary.router)
app.include_router(tts.router)
app.include_router(vocabulary.router)
app.include_router(bookmarks.router)
app.include_router(ai.router)
app.include_router(rag.router)
app.include_router(dicts.router)
app.include_router(test_router.router)

# 挂载静态目录
from .config import UPLOADS_DIR
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
# app.mount("/extracted", StaticFiles(directory="extracted"), name="extracted")


@app.get("/")
def read_root():
    return {"message": "Welcome to Immersive English API"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


