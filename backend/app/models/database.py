from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv
from app.config import DB_PATH, BASE_DIR, UPLOADS_DIR, DICTS_DIR

load_dotenv()

# 使用 config.py 中定义的 DB_PATH
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

# 确保父目录存在
if DB_PATH.parent and not DB_PATH.parent.exists():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 导出配置常量供其他模块使用
__all__ = ['engine', 'SessionLocal', 'Base', 'get_db', 'BASE_DIR', 'UPLOADS_DIR', 'DICTS_DIR']