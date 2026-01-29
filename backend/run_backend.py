import os
import sys
import argparse
import uvicorn
from pathlib import Path

# 添加当前目录到 sys.path，确保能导入 app 模块
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def main():
    parser = argparse.ArgumentParser(description="Duodushu Backend Server")
    parser.add_argument("--port", type=int, default=8000, help="Port to run the server on")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host to bind")
    parser.add_argument("--data-dir", type=str, help="Path to data directory")
    
    args = parser.parse_args()

    # 设置环境变量，供 app.config 使用
    if args.data_dir:
        data_path = Path(args.data_dir).resolve()
        os.environ["APP_DATA_DIR"] = str(data_path)
        print(f"[Backend] Data directory set to: {data_path}")
    
    # 导入 app (必须在设置环境变量之后)
    # 导入 app (必须在设置环境变量之后)
    try:
        from app.main import app
    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        log_path = Path("backend_startup_error.txt")
        if args.data_dir:
            log_path = Path(args.data_dir) / "backend_startup_error.txt"
        
        with open(log_path, "w", encoding="utf-8") as f:
            f.write(f"Failed to import app:\n{error_msg}")

        print(f"[Backend] Failed to import app: {e}")
        sys.exit(1)

    print(f"[Backend] Starting server on {args.host}:{args.port}")
    
    uvicorn.run(app, host=args.host, port=args.port)

if __name__ == "__main__":
    main()
