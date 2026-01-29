from ..models.database import engine, Base
from ..models import models

def init_db():
    """初始化数据库表"""
    Base.metadata.create_all(bind=engine)
    print("Database initialization completed.")

if __name__ == "__main__":
    init_db()
