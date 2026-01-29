import sqlite3
import json
import logging
from pathlib import Path

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_PATH = Path("backend/data/open_dict.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Wiki词典表
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS wiktionary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL,
        word_lower TEXT NOT NULL,
        pos TEXT,
        pronunciation TEXT,
        definition_en TEXT,
        definition_cn TEXT,
        extra_data TEXT
    )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_wiktionary_word ON wiktionary(word_lower)")
    
    # 2. Tatoeba 例句表
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tatoeba_examples (
        id INTEGER PRIMARY KEY,
        sentence_en TEXT NOT NULL,
        sentence_cn TEXT NOT NULL,
        tags TEXT
    )
    """)
    # 3. 单词-例句映射表 (用于快速检索)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS word_example_map (
        word_lower TEXT NOT NULL,
        example_id INTEGER NOT NULL,
        FOREIGN KEY(example_id) REFERENCES tatoeba_examples(id)
    )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_map_word ON word_example_map(word_lower)")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    logger.info(f"Initialized database at {DB_PATH}")
