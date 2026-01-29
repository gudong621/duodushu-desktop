import requests
import time
import os

API_URL = "http://localhost:8000/api/books"
FILE_PATH = r"D:\build\interactive-book\DK The Mysteries of the Universe.pdf"

def test_upload_flow():
    if not os.path.exists(FILE_PATH):
        print(f"Skipping test: File not found at {FILE_PATH}")
        return

    print(f"Uploading {FILE_PATH}...")
    with open(FILE_PATH, "rb") as f:
        files = {"file": f}
        response = requests.post(f"{API_URL}/upload", files=files)
    
    if response.status_code != 200:
        print(f"Upload failed: {response.text}")
        return

    data = response.json()
    book_id = data["book_id"]
    print(f"Upload success! Book ID: {book_id}")
    print("Waiting for parsing...")

    for _ in range(30): # Wait up to 30 seconds
        status_res = requests.get(f"{API_URL}/{book_id}/status")
        status_data = status_res.json()
        status = status_data["status"]
        print(f"Status: {status}")
        
        if status == "completed":
            print("Parsing completed successfully!")
            print(f"Total pages: {status_data['total_pages']}")
            # Verify page content
            page_res = requests.get(f"{API_URL}/{book_id}/pages/1")
            if page_res.status_code == 200:
                print("Page 1 content retrieved successfully.")
            else:
                print("Failed to get page 1.")
            return
        elif status == "failed":
            print("Parsing failed.")
            return
        
        time.sleep(1)
    
    print("Timeout waiting for parsing.")

if __name__ == "__main__":
    test_upload_flow()
