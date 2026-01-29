import sqlite3
import logging
import re
import os
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_PATH = Path("backend/data/open_dict.db")
TATOEBA_FILE = Path("backend/data/tatoeba/cmn.txt")

def import_tatoeba_filtered():
    """
    导入从 ManyThings.org 下载的 Tatoeba 过滤版数据。
    格式: English \t Chinese \t Attribution
    """
    if not TATOEBA_FILE.exists():
        logger.error(f"File not found: {TATOEBA_FILE}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    count = 0
    batch_sentences = []
    batch_map = []
    
    logger.info(f"Importing sentences from {TATOEBA_FILE}...")
    
    with open(TATOEBA_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split('\t')
            if len(parts) < 2:
                continue
                
            en_sent = parts[0]
            cn_sent = parts[1]
            
            # 1. 存入例句表
            cursor.execute("""
                INSERT INTO tatoeba_examples (sentence_en, sentence_cn, tags)
                VALUES (?, ?, ?)
            """, (en_sent, cn_sent, "tatoeba"))
            sentence_id = cursor.lastrowid
            
            # 2. 建立单词映射索引 (分词)
            # 匹配单词，包括带有撇号的词如 don't
            words = re.findall(r"\b[a-zA-Z']+\b", en_sent.lower())
            for w in set(words): # 去重
                if len(w) > 1: # 过滤单字母（如 a, i 暂时保留可以根据需要过滤）
                    batch_map.append((w, sentence_id))
            
            count += 1
            if count % 1000 == 0:
                logger.info(f"Processed {count} sentences...")
                
    # 批量插入映射表以提高性能
    logger.info("Building word index map...")
    cursor.executemany("INSERT INTO word_example_map (word_lower, example_id) VALUES (?, ?)", batch_map)
    
    conn.commit()
    conn.close()
    logger.info(f"Successfully imported {count} sentences and built word index.")

if __name__ == "__main__":
    import_tatoeba_filtered()
