from app.models.database import SessionLocal
from app.models.models import Book
from app.services.book_service import verify_and_process_book_task
import os
import sys

# Ensure we are in backend dir context
sys.path.append(os.getcwd())

def regenerate_all():
    db = SessionLocal()
    try:
        books = db.query(Book).all()
        print(f"Found {len(books)} books. Starting regeneration...")
        for book in books:
            print(f"Processing cover for: {book.title} ({book.id})")
            verify_and_process_book_task(book.id)
        print("Done!")
    finally:
        db.close()

if __name__ == '__main__':
    regenerate_all()
