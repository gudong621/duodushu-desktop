import sys
import os
from pathlib import Path

# 添加项目根目录到 sys.path
backend_dir = r"d:\build\duodushu\backend"
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

try:
    # 彻底修正：确保 backend 目录本身在 path 中，且其父目录也在，以便 app 作为包被识别
    project_root = str(Path(backend_dir).parent)
    if backend_dir not in sys.path: sys.path.insert(0, backend_dir)
    if project_root not in sys.path: sys.path.insert(0, project_root)
    
    from app.services.dict_service import lookup_word
    from app.database import SessionLocal

    
    db = SessionLocal()
    word = "some"
    res = lookup_word(db, word)
    
    print(f"Query Word: {word}")
    if res:
        print(f"Result: Found")
        print(f"Source: {res.get('source')}")
        print(f"Is ECDICT: {res.get('is_ecdict')}")
        print(f"HTML Content Exists: {'html_content' in res}")
        # print(f"HTML Length: {len(res.get('html_content', ''))}")
    else:
        print(f"Result: Not Found")
    
    db.close()
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

