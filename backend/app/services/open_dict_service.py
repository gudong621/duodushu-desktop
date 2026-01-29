import sqlite3
import logging
from pathlib import Path
from typing import Optional, Dict, List
from app.config import OPEN_DICT_DB_PATH

logger = logging.getLogger(__name__)

def lookup_word_open(word: str) -> Optional[Dict]:
    """
    在开源数据库 open_dict.db 中查询词典定义。
    """
    if not OPEN_DICT_DB_PATH.exists():
        return None

    try:
        conn = sqlite3.connect(str(OPEN_DICT_DB_PATH))
        cursor = conn.cursor()
        
        # 精确匹配或小写匹配
        word_lower = word.lower()
        cursor.execute("""
            SELECT word, pos, pronunciation, definition_en, definition_cn, extra_data 
            FROM wiktionary 
            WHERE word_lower = ? LIMIT 1
        """, (word_lower,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "word": row[0],
                "partOfSpeech": row[1],
                "phonetic": row[2],
                "definition_en": row[3],
                "chinese_translation": row[4],
                "source": "Wiktionary (Open)",
                "meanings": [
                    {
                        "partOfSpeech": row[1],
                        "definitions": [{"definition": row[3], "translation": row[4]}]
                    }
                ]
            }
        return None
    except Exception as e:
        logger.error(f"Error querying open_dict: {e}")
        return None

def get_examples_open(word: str, limit: int = 10) -> List[Dict]:
    """
    从 Tatoeba 数据库中检索指定单词的实例句。
    """
    if not OPEN_DICT_DB_PATH.exists():
        return []

    try:
        conn = sqlite3.connect(str(OPEN_DICT_DB_PATH))
        cursor = conn.cursor()
        
        word_lower = word.lower()
        # 联表查询：单词映射 -> 实例句
        cursor.execute("""
            SELECT e.sentence_en, e.sentence_cn 
            FROM tatoeba_examples e
            JOIN word_example_map m ON e.id = m.example_id
            WHERE m.word_lower = ?
            LIMIT ?
        """, (word_lower, limit))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [{"en": r[0], "cn": r[1]} for r in rows]
    except Exception as e:
        logger.error(f"Error getting examples from open_dict: {e}")
        return []
