
import os
import zipfile
from pathlib import Path

def package_dicts():
    backend_dir = Path(__file__).parent.parent
    dist_dir = backend_dir / "dist" / "dicts"
    dist_dir.mkdir(parents=True, exist_ok=True)
    
    frontend_styles_dir = backend_dir / "frontend" / "src" / "styles" / "dictionary"
    # Wait, backend_dir is d:\build\interactive-book\backend
    # frontend is d:\build\interactive-book\frontend
    # so frontend_styles_dir = backend_dir.parent / "frontend" / "src" / "styles" / "dictionary"
    
    frontend_styles_dir = backend_dir.parent / "frontend" / "src" / "styles" / "dictionary"

    dicts = [
        {
            "name": "longman",
            "source_dir": backend_dir.parent / "dictionary" / "朗文",
            "files": {
                "朗文当代高级英语辞典6th.mdx": "longman.mdx",
                "朗文当代高级英语辞典6th.js": "longman.js",
                "朗文当代高级英语辞典6th.png": "longman.png"
            },
            "css_file": frontend_styles_dir / "longman.css",
            "css_name": "longman.css"
        },
        {
            "name": "oxford",
            "source_dir": backend_dir.parent / "dictionary" / "牛津" / "OALD 2024.09",
            "files": {
                "oaldpe.mdx": "oxford.mdx",
                "oaldpe.js": "oxford.js",
                "oaldpe.png": "oxford.png",
                "oaldpe-jquery.js": "oxford-jquery.js"
            },
            "css_file": frontend_styles_dir / "oxford.css",
            "css_name": "oxford.css"
        },
        {
            "name": "webster",
            "source_dir": backend_dir.parent / "dictionary" / "韦氏",
            "files": {
                "maldpe.mdx": "webster.mdx", 
                "maldpe.js": "webster.js",
                "maldpe.jpg": "webster.jpg",
                "maldpe-jquery-3.6.0.min.js": "webster-jquery.min.js"
            },
            "css_file": frontend_styles_dir / "webster.css",
            "css_name": "webster.css"
        }
    ]
    
    for d in dicts:
        zip_path = dist_dir / f"{d['name']}.zip"
        print(f"Packaging {d['name']} to {zip_path}...")
        
        try:
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
                # Add regular files from source_dir
                for src_name, target_name in d['files'].items():
                    file_path = d['source_dir'] / src_name
                    if file_path.exists():
                        print(f"  Adding {src_name} as {target_name}")
                        zf.write(file_path, arcname=target_name)
                    else:
                        print(f"  Warning: {src_name} not found at {file_path}")
                
                # Add CSS file from frontend
                if 'css_file' in d:
                     css_path = d['css_file']
                     if css_path.exists():
                          print(f"  Adding {css_path.name} as {d['css_name']} from frontend")
                          zf.write(css_path, arcname=d['css_name'])
                     else:
                          print(f"  Warning: CSS file not found at {css_path}")

            print(f"Done packaging {d['name']}.\n")
        except Exception as e:
            print(f"Error packaging {d['name']}: {e}\n")

if __name__ == "__main__":
    package_dicts()
