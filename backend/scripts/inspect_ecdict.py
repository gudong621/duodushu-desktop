import sqlite3
from pathlib import Path

def inspect():
    db_path = Path(__file__).parent.parent.parent / "data" / "ecdict.db"
    if not db_path.exists():
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get columns
    cursor.execute("PRAGMA table_info(stardict)")
    columns = [row[1] for row in cursor.fetchall()]
    print(f"Available Columns: {columns}")
    
    # Get a sample for common word 'often'
    cursor.execute("SELECT * FROM stardict WHERE word = 'often'")
    row = cursor.fetchone()
    if row:
        data = dict(zip(columns, row))
        print("\nSample Data for 'often':")
        for k, v in data.items():
            print(f"{k}: {v}")
            
    conn.close()

if __name__ == "__main__":
    inspect()
