import sqlite3
import json
import logging
import os
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_PATH = Path("backend/data/open_dict.db")

def parse_wiktionary_jsonl(file_path: Path):
    """
    解析 Kaikki.org 提供的 Wiktionary JSONL 数据。
    数据文档见: https://kaikki.org/dictionary/rawdata.html
    """
    if not file_path.exists():
        logger.error(f"File not found: {file_path}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    count = 0
    batch = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                data = json.loads(line)
                word = data.get("word")
                if not word:
                    continue
                
                # 提取音标 (取第一个)
                pronunciations = data.get("sounds", [])
                ipa = None
                for p in pronunciations:
                    if "ipa" in p:
                        ipa = p["ipa"]
                        break
                
                # 提取释义和词性
                senses_list = data.get("senses", [])
                definitions_en = []
                definitions_cn = []
                
                pos = data.get("pos")
                
                for sense in senses_list:
                    # 英文释义
                    glosses = sense.get("glosses", [])
                    if glosses:
                        definitions_en.extend(glosses)
                    
                    # 寻找可能的中文翻译 (Wiktionary 的翻译字段比较复杂)
                    translations = sense.get("translations", [])
                    for trans in translations:
                        if trans.get("code") == "zh":
                            definitions_cn.append(trans.get("word"))
                
                # 存入批处理
                batch.append((
                    word,
                    word.lower(),
                    pos,
                    ipa,
                    "; ".join(definitions_en),
                    "; ".join(definitions_cn[:5]), # 仅取前5个关键翻译
                    json.dumps(data) # 原始数据备查
                ))
                
                count += 1
                if len(batch) >= 1000:
                    cursor.executemany("""
                    INSERT INTO wiktionary (word, word_lower, pos, pronunciation, definition_en, definition_cn, extra_data)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, batch)
                    conn.commit()
                    batch = []
                    logger.info(f"Processed {count} words...")
                    
            except Exception as e:
                logger.error(f"Error parsing line: {e}")
                continue
                
    if batch:
        cursor.executemany("""
        INSERT INTO wiktionary (word, word_lower, pos, pronunciation, definition_en, definition_cn, extra_data)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, batch)
        conn.commit()

    conn.close()
    logger.info(f"Finished! Total {count} words processed.")

if __name__ == "__main__":
    # 使用示例，假设用户下载了数据存放在 data 目录
    # download from: https://kaikki.org/dictionary/English/kaikki.org-dictionary-English.jsonl
    raw_data_file = Path("data/kaikki.org-dictionary-English.jsonl")
    if raw_data_file.exists():
        parse_wiktionary_jsonl(raw_data_file)
    else:
        logger.info(f"Please download the Wiktionary JSONL file and place it at: {raw_data_file}")
