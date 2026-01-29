"""
词典管理 API 路由
"""

from fastapi import APIRouter, UploadFile, HTTPException, Form
from pydantic import BaseModel
from typing import List, Optional
from pathlib import Path
import shutil
import tempfile
import re
import threading

# 从正确的位置导入 DictManager
from app.services.dict_manager import DictManager

# 安全常量
MAX_MDX_SIZE = 500 * 1024 * 1024  # 500 MB

router = APIRouter(prefix="/api/dicts", tags=["dicts"])

_dict_manager = None
_dict_manager_lock = threading.Lock()


def get_dict_manager():
    global _dict_manager
    if _dict_manager is not None:
        return _dict_manager

    with _dict_manager_lock:
        if _dict_manager is not None:  # Double-checked locking
            return _dict_manager

        _dict_manager = DictManager()
        return _dict_manager


def set_dict_manager(manager: DictManager):
    """用于测试注入"""
    global _dict_manager
    with _dict_manager_lock:
        _dict_manager = manager


class DictInfo(BaseModel):
    name: str
    type: str
    size: int
    word_count: int
    is_active: bool
    is_builtin: bool


class PriorityRequest(BaseModel):
    priority: List[str]


class ToggleRequest(BaseModel):
    active: bool


@router.get("/", response_model=List[DictInfo])
def get_dicts():
    manager = get_dict_manager()
    return manager.get_dicts()


@router.post("/import")
def import_dict(file: UploadFile, name: Optional[str] = Form(None)):
    manager = get_dict_manager()

    if not file.filename or not (file.filename.endswith(".mdx") or file.filename.endswith(".zip")):
        raise HTTPException(400, "只支持 .mdx 或 .zip 文件")

    # 清理文件名，防止路径遍历攻击
    clean_name = name or Path(file.filename).stem
    clean_name = re.sub(r'[<>:"/\\|?*]', "_", clean_name)
    if not clean_name or clean_name.startswith("."):
        raise HTTPException(400, "无效的文件名")

    # 检查文件大小
    file.file.seek(0, 2)  # 移到末尾
    file_size = file.file.tell()
    file.file.seek(0)  # 重置

    if file_size > MAX_MDX_SIZE:
        size_mb = file_size / 1024 / 1024
        max_mb = MAX_MDX_SIZE / 1024 / 1024
        raise HTTPException(413, f"文件过大 ({size_mb:.2f} MB)，最大支持 {max_mb} MB")

    tmp_path = None
    suffix = ".zip" if file.filename.endswith(".zip") else ".mdx"
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = Path(tmp.name)

        result = manager.import_dict(tmp_path, clean_name)
        return {"message": "词典导入成功", "dict": result}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"导入失败: {str(e)}")
    finally:
        if tmp_path and tmp_path.exists():
            tmp_path.unlink()


@router.delete("/{dict_name}")
def remove_dict(dict_name: str):
    manager = get_dict_manager()
    try:
        manager.remove_dict(dict_name)
        return {"message": "词典已删除"}
    except ValueError as e:
        raise HTTPException(404, str(e))


@router.post("/priority")
def set_priority(request: PriorityRequest):
    manager = get_dict_manager()
    try:
        manager.set_priority(request.priority)
        return {"message": "优先级已更新", "priority": request.priority}
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.patch("/{dict_name}/toggle")
def toggle_dict(dict_name: str, request: ToggleRequest):
    manager = get_dict_manager()
    try:
        manager.toggle_dict(dict_name, request.active)
        return {
            "message": f"词典已{'启用' if request.active else '禁用'}",
            "dict_name": dict_name,
            "is_active": request.active,
        }
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.get("/{dict_name}/info")
def get_dict_info(dict_name: str):
    manager = get_dict_manager()
    dicts = manager.get_dicts()

    for d in dicts:
        if d["name"] == dict_name:
            return d

    raise HTTPException(404, f"词典 {dict_name} 不存在")


@router.post("/{dict_name}/lookup")
def lookup_dict_word(dict_name: str, word: str):
    manager = get_dict_manager()

    old_priority = manager.config["priority"].copy()

    try:
        manager.config["priority"] = [dict_name]
        result = manager.lookup_word(word)

        if not result:
            raise HTTPException(404, f"在词典 {dict_name} 中未找到单词: {word}")

        return result

    finally:
        manager.config["priority"] = old_priority


@router.get("/{dict_name}/resource/{path:path}")
def get_dict_resource(dict_name: str, path: str):
    manager = get_dict_manager()
    # Decode path if needed (FastAPI handles path parameters, but sometimes URL encoding persists)
    # usually path is raw string.
    
    content = manager.get_resource(dict_name, path)
    if not content:
        # Try with leading slash if not present
        if not path.startswith("/"):
             content = manager.get_resource(dict_name, f"/{path}")
             
    if not content:
        raise HTTPException(404, "Resource not found")
    
    # Determine media type based on extension
    import mimetypes
    media_type, _ = mimetypes.guess_type(path)
    if not media_type:
        media_type = "application/octet-stream"
        
    from fastapi.responses import Response
    return Response(content=content, media_type=media_type)
