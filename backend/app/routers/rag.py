"""
RAG API 简化版本

提供基本的语义搜索和 AI 问答功能
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, Field
from typing import List, Optional

from ..models.database import get_db
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/rag", tags=["RAG"])


class SearchRequest(BaseModel):
    """语义搜索请求"""

    query: str
    n_results: int = Field(5, ge=1, le=20)


class SearchResponse(BaseModel):
    """语义搜索响应"""

    success: bool
    results: List[dict]
    message: str


class ChatRequest(BaseModel):
    """AI 问答请求"""

    query: str
    conversation_history: Optional[List[dict]] = None
    max_context_tokens: int = Field(4000, ge=100)


class ChatResponse(BaseModel):
    """AI 问答响应"""

    success: bool
    answer: str
    sources: List[dict]
    context_used: List[str]
    citations_used: List[int]


def format_source_info(book_id, page_number, chunk_text, distance):
    """格式化来源信息"""
    return {
        "book_id": book_id,
        "page_number": page_number,
        "chunk_text": chunk_text[:200],
        "distance": float(distance),
    }


@router.post("/search", response_model=SearchResponse)
async def semantic_search(request: SearchRequest, db: Session = Depends(get_db)):
    """简化版语义搜索"""
    try:
        logger.info(f"Search request: {request.query}")

        # 模拟搜索结果
        mock_results = []

        # 模拟返回 2 个结果
        mock_results.append(
            {
                "book_id": "test_book",
                "page_number": 1,
                "chunk_text": f"Sample content about {request.query}...",
                "distance": 0.1,
            }
        )
        mock_results.append(
            {
                "book_id": "test_book",
                "page_number": 2,
                "chunk_text": f"Another example about {request.query}...",
                "distance": 0.2,
            }
        )

        response = SearchResponse(
            success=True,
            results=mock_results,
            message=f"Found {len(mock_results)} results",
        )

        logger.info(f"Search completed")
        return response

    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", response_model=ChatResponse)
async def rag_chat(request: ChatRequest, db: Session = Depends(get_db)):
    """简化版 AI 问答"""
    try:
        logger.info(f"Chat request: {request.query}")

        # 简单回答
        answer = f'这是基于 RAG 系统的简化演示版本。\\n\\n对于问题 "{request.query}"，我暂时不实现完整的 RAG 检索和上下文检索。\\n\\n请稍后等待完整版完成后使用。'

        response = ChatResponse(
            success=True,
            answer=answer,
            sources=[],
            context_used=[],
            citations_used=[],
        )

        logger.info("Chat completed")
        return response

    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
