"""书签管理 API 路由"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from ..models.database import get_db
from ..models.models import Bookmark, Book

router = APIRouter(prefix="/api/bookmarks", tags=["bookmarks"])


class BookmarkCreate(BaseModel):
    """创建书签请求模型"""

    book_id: str
    page_number: int
    title: Optional[str] = None
    note: Optional[str] = None


class BookmarkResponse(BaseModel):
    """书签响应模型"""

    id: int
    book_id: str
    page_number: int
    title: Optional[str] = None
    note: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


@router.post("/", response_model=BookmarkResponse)
def create_bookmark(item: BookmarkCreate, db: Session = Depends(get_db)):
    """添加书签"""
    # 验证书籍存在
    book = db.query(Book).filter(Book.id == item.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # 检查是否已存在相同页码的书签
    existing = (
        db.query(Bookmark).filter(Bookmark.book_id == item.book_id, Bookmark.page_number == item.page_number).first()
    )

    if existing:
        # 更新现有书签
        if item.title:
            existing.title = item.title  # type: ignore
        if item.note:
            existing.note = item.note  # type: ignore
        db.commit()
        db.refresh(existing)
        return format_bookmark_response(existing)

    # 创建新书签
    title = item.title or f"第 {item.page_number} 页"
    bookmark = Bookmark(book_id=item.book_id, page_number=item.page_number, title=title, note=item.note)
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)
    return format_bookmark_response(bookmark)


@router.get("/", response_model=List[BookmarkResponse])
def get_bookmarks(book_id: Optional[str] = None, db: Session = Depends(get_db)):
    """获取书签列表"""
    query = db.query(Bookmark)
    if book_id:
        query = query.filter(Bookmark.book_id == book_id)

    bookmarks = query.order_by(Bookmark.page_number).all()
    return [format_bookmark_response(b) for b in bookmarks]


@router.delete("/{bookmark_id}")
def delete_bookmark(bookmark_id: int, db: Session = Depends(get_db)):
    """删除书签"""
    bookmark = db.query(Bookmark).filter(Bookmark.id == bookmark_id).first()
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    db.delete(bookmark)
    db.commit()
    return {"status": "success", "message": "Bookmark deleted"}


@router.get("/check")
def check_bookmark(book_id: str, page_number: int, db: Session = Depends(get_db)):
    """检查某页是否有书签"""
    bookmark = db.query(Bookmark).filter(Bookmark.book_id == book_id, Bookmark.page_number == page_number).first()

    if bookmark:
        return {"has_bookmark": True, "bookmark": format_bookmark_response(bookmark)}
    return {"has_bookmark": False, "bookmark": None}


def format_bookmark_response(bookmark: Bookmark) -> BookmarkResponse:
    """格式化书签响应"""
    return BookmarkResponse(
        id=bookmark.id,  # type: ignore
        book_id=bookmark.book_id,  # type: ignore
        page_number=bookmark.page_number,  # type: ignore
        title=bookmark.title,  # type: ignore
        note=bookmark.note,  # type: ignore
        created_at=bookmark.created_at.isoformat() if bookmark.created_at else None,  # type: ignore
    )
