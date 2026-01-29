
import sys
import shutil
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.dict_manager import DictManager

def verify_import():
    backend_dir = Path(__file__).parent.parent
    zip_path = backend_dir / "dist" / "dicts" / "webster.zip"
    
    if not zip_path.exists():
        print(f"Error: {zip_path} not found. Run package_dicts.py first.")
        return

    print(f"Testing import of {zip_path}...")
    
    manager = DictManager()
    dict_name = "test_webster"
    
    # Cleanup previous test if valid
    if dict_name in manager.config["dicts"]:
        print("Removing previous test dictionary...")
        manager.remove_dict(dict_name)

    try:
        manager.import_dict(zip_path, dict_name)
        print("Import successful!")
        
        # Verify files
        imported_dir = manager.imported_dir
        
        expected_files = [
            "test_webster.mdx", # DictManager renames MDX to dict_name.mdx
            # The asset files should be renamed to test_webster.* by our new logic because "webster" == "webster" 
            # Wait, DictManager logic:
            # if file_path.stem == src_stem: rename to dict_name
            # In package_dicts.py, we renamed maldpe.mdx -> webster.mdx
            # So import sees src_mdx as webster.mdx (src_stem="webster")
            # And maldpe.css -> webster.css (stem="webster")
            # So if file_path.stem ("webster") == src_stem ("webster"), it renames to dict_name ("test_webster").
            
            "test_webster.css",
            "test_webster.js",
            "test_webster.jpg"
        ]
        
        missing = []
        for f in expected_files:
            if not (imported_dir / f).exists():
                missing.append(f)
        
        if missing:
            print(f"FAILED: Missing files: {missing}")
        else:
            print("SUCCESS: All expected files found.")
            
    except Exception as e:
        print(f"FAILED: Import error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    verify_import()
