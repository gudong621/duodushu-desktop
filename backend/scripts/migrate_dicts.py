
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.dict_manager import DictManager

def migrate():
    print("Starting dictionary migration...")
    manager = DictManager()
    
    # Define legacy paths
    backend_dir = Path(__file__).parent.parent
    legacy_base = backend_dir / "dictionary"
    
    dicts_to_import = [
        ("朗文当代", legacy_base / "朗文" / "朗文当代高级英语辞典6th.mdx"),
        ("牛津", legacy_base / "牛津" / "OALD 2024.09" / "oaldpe.mdx"),
        ("韦氏", legacy_base / "韦氏" / "maldpe.mdx"),
    ]
    
    for name, path in dicts_to_import:
        if not path.exists():
            print(f"Warning: Legacy dictionary not found at {path}")
            continue
            
        print(f"Importing {name} from {path}...")
        try:
            # Check if already exists (by name)
            if name in manager.config["dicts"]:
                 print(f"Dictionary {name} already imported.")
                 # Force re-index? No, DictManager checks config.
                 # If we want to ensure it works with new index, we might need to remove and re-import
                 # or just update index?
                 # DictManager.import_dict raises ValueError if dict exists.
                 # Let's check config.
                 pass
            else:
                 manager.import_dict(path, name)
                 print(f"Successfully imported {name}")
        except Exception as e:
            print(f"Error importing {name}: {e}")

    # Set priority including ECDICT
    priority = ["朗文当代", "牛津", "韦氏", "ECDICT"]
    manager.set_priority(priority)
    print("Migration complete. Priority updated.")

if __name__ == "__main__":
    migrate()
