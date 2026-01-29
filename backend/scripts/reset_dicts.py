
import sys
import shutil
import json
import sqlite3
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent))

def reset_dicts():
    # Path resolution:
    # __file__ = backend/scripts/reset_dicts.py
    # .parent = backend/scripts
    # .parent.parent = backend
    # .parent.parent.parent = project_root (interactive-book)
    project_root = Path(__file__).parent.parent.parent
    
    # 1. Clear config
    config_path = project_root / "dicts" / "dicts_config.json"
    if config_path.exists():
        with open(config_path, "w", encoding="utf-8") as f:
            json.dump({"dicts": {}, "priority": ["ECDICT"], "auto_index": True}, f, indent=2)
        print("Config reset.")
    else:
        print(f"Config file not found at {config_path}")

    # 2. Delete imported files
    imported_dir = project_root / "dicts" / "imported"
    if imported_dir.exists():
        shutil.rmtree(imported_dir)
        imported_dir.mkdir()
        print(f"Cleared {imported_dir}")
    else:
        print(f"Imported dir not found at {imported_dir}")

    # 3. Delete index DB (Root)
    index_db = project_root / "dicts" / "mdx_index.db"
    if index_db.exists():
        index_db.unlink()
        print(f"Deleted {index_db}")

    # 3.1. Delete index DB (Backend/Data - Legacy/Ghost location)
    legacy_index_db = project_root / "backend" / "data" / "mdx_index.db"
    if legacy_index_db.exists():
        legacy_index_db.unlink()
        print(f"Deleted legacy {legacy_index_db}")

    # 4. Clear CacheDictionary in App DB (backend/data/app.db)
    # backend is project_root / "backend"
    app_db = project_root / "backend" / "data" / "app.db"
    if app_db.exists():
        try:
            conn = sqlite3.connect(app_db)
            cursor = conn.cursor()
            cursor.execute("DELETE FROM cache_dictionary")
            count = cursor.rowcount
            conn.commit()
            conn.close()
            print(f"Cleared {count} entries from dictionary cache.")
        except Exception as e:
            print(f"Failed to clear dictionary cache: {e}")
    else:
         print("App DB not found, skipping cache clear.")


if __name__ == "__main__":
    reset_dicts()
