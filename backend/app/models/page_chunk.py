from sqlalchemy import Column, Integer, Text, ForeignKey, JSON, DateTime
from sqlalchemy.sql import func
from datetime import datetime
from .database import Base


class PageChunk(Base):
    """
    页面内容分块表
    用于 RAG 系统的语义搜索和内容切片
    """

    __tablename__ = "page_chunks"

    id = Column(Integer, primary_key=True, index=True)
    page_id = Column(
        Integer, ForeignKey("pages.id", ondelete="CASCADE"), nullable=False, index=True
    )
    chunk_index = Column(Integer, nullable=False)  # 该片段在页面中的顺序
    content = Column(Text, nullable=False)  # 实际的文本片段
    token_count = Column(Integer)  # Token 数量，用于控制上下文窗口
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # 可以添加更多元数据字段（使用 chunk_metadata 避免 SQLAlchemy 保留字冲突）
    chunk_metadata = Column(JSON)  # 额外的元数据（如段落类型、标题等）
