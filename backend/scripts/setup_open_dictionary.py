#!/usr/bin/env python3
"""
开源词典数据设置脚本
用于初始化 PUBLIC 模式所需的开源词典数据

功能：
1. 检查并创建 open_dict.db 的表结构（wiktionary, tatoeba_examples, word_example_map）
2. 从 kaikki.org-dictionary-English.jsonl 导入 Wiktionary 数据（如果文件存在）
3. 验证/导入 Tatoeba 数据
4. 验证 ECDICT 数据（data/ecdict.db）
5. 打印摘要统计

使用方法：
    python backend/scripts/setup_open_dictionary.py
"""

import sqlite3
import json
import logging
import os
import sys
import re
from pathlib import Path

# 添加项目根目录到路径
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(
            project_root / "backend" / "scripts" / "setup_open_dictionary.log",
            encoding="utf-8",
        ),
    ],
)
logger = logging.getLogger(__name__)

# 数据库路径
OPEN_DICT_DB = project_root / "backend" / "data" / "open_dict.db"
ECDICT_DB = project_root / "data" / "ecdict.db"
WIKTIONARY_JSONL = project_root / "data" / "kaikki.org-dictionary-English.jsonl"
TATOEBA_FILE = project_root / "backend" / "data" / "tatoeba" / "cmn.txt"


def check_open_dict_database():
    """检查并创建 open_dict.db 的表结构"""
    logger.info("检查 open_dict 数据库...")

    if not OPEN_DICT_DB.parent.exists():
        OPEN_DICT_DB.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(str(OPEN_DICT_DB))
    cursor = conn.cursor()

    # 创建 Wiktionary 表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS wiktionary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word TEXT NOT NULL,
            word_lower TEXT NOT NULL,
            pos TEXT,
            pronunciation TEXT,
            definition_en TEXT,
            definition_cn TEXT,
            extra_data TEXT,
            UNIQUE(word, pos)
        )
    """)
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_wiktionary_word ON wiktionary(word_lower)"
    )

    # 创建 Tatoeba 表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tatoeba_examples (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sentence_en TEXT NOT NULL,
            sentence_cn TEXT NOT NULL,
            tags TEXT
        )
    """)

    # 创建单词-例句映射表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS word_example_map (
            word_lower TEXT NOT NULL,
            example_id INTEGER NOT NULL,
            PRIMARY KEY (word_lower, example_id)
        )
    """)
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_word_map ON word_example_map(word_lower)"
    )

    conn.commit()
    conn.close()
    logger.info("数据库结构验证完成")


def import_wiktionary():
    """从 JSONL 文件导入 Wiktionary 数据"""
    if not WIKTIONARY_JSONL.exists():
        logger.warning(f"Wiktionary 数据文件不存在: {WIKTIONARY_JSONL}")
        logger.info("请从以下地址下载:")
        logger.info(
            "  https://kaikki.org/dictionary/English/kaikki.org-dictionary-English.jsonl (约1.5GB)"
        )
        logger.info("或压缩版本:")
        logger.info(
            "  https://kaikki.org/dictionary/English/kaikki.org-dictionary-English-compound-types.jsonl"
        )
        logger.info("将文件放置于 data/ 目录下")
        return False

    file_size = WIKTIONARY_JSONL.stat().st_size
    logger.info(f"从 {WIKTIONARY_JSONL.name} 导入 Wiktionary 数据...")
    logger.info(f"文件大小: {file_size / (1024 * 1024):.1f} MB")

    conn = sqlite3.connect(str(OPEN_DICT_DB))
    cursor = conn.cursor()

    count = 0
    batch = []
    batch_size = 1000
    processed_bytes = 0

    with open(WIKTIONARY_JSONL, "r", encoding="utf-8") as f:
        for line in f:
            processed_bytes += len(line.encode("utf-8"))

            try:
                data = json.loads(line)
                word = data.get("word")
                if not word:
                    continue

                # 提取音标
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

                    # 中文翻译
                    translations = sense.get("translations", [])
                    for trans in translations:
                        if trans.get("code") == "zh":
                            definitions_cn.append(trans.get("word"))

                # 存入批处理
                batch.append(
                    (
                        word,
                        word.lower(),
                        pos,
                        ipa,
                        "; ".join(definitions_en),
                        "; ".join(definitions_cn[:5]),
                        json.dumps(data, ensure_ascii=False),
                    )
                )

                count += 1
                if len(batch) >= batch_size:
                    cursor.executemany(
                        """
                        INSERT OR REPLACE INTO wiktionary
                        (word, word_lower, pos, pronunciation, definition_en, definition_cn, extra_data)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                        batch,
                    )
                    conn.commit()
                    if count % 10000 == 0:
                        progress = (processed_bytes / file_size) * 100
                        logger.info(f"  进度: {progress:.1f}% | 已处理: {count:,} 词目")
                    batch = []

            except Exception as e:
                logger.warning(f"解析行时出错: {e}")
                continue

    # 插入剩余数据
    if batch:
        cursor.executemany(
            """
            INSERT OR REPLACE INTO wiktionary
            (word, word_lower, pos, pronunciation, definition_en, definition_cn, extra_data)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
            batch,
        )
        conn.commit()

    conn.close()
    logger.info(f"Wiktionary 导入完成: {count:,} 词目")
    return True


def import_tatoeba():
    """从 cmn.txt 导入 Tatoeba 数据"""
    if not TATOEBA_FILE.exists():
        logger.warning(f"Tatoeba 数据文件不存在: {TATOEBA_FILE}")
        logger.info("请从以下地址下载:")
        logger.info("  https://tatoeba.org/eng/downloads")
        logger.info("下载 cmn-eng.tar.bz2，解压后得到 cmn.txt")
        logger.info("将文件放置于 backend/data/tatoeba/ 目录下")
        return False

    file_size = TATOEBA_FILE.stat().st_size
    logger.info(f"从 {TATOEBA_FILE.name} 导入 Tatoeba 数据...")
    logger.info(f"文件大小: {file_size / (1024 * 1024):.1f} MB")

    conn = sqlite3.connect(str(OPEN_DICT_DB))
    cursor = conn.cursor()

    # 清空现有数据
    cursor.execute("DELETE FROM tatoeba_examples")
    cursor.execute("DELETE FROM word_example_map")
    conn.commit()

    count = 0
    batch_examples = []
    batch_map = []
    batch_size = 1000
    processed_bytes = 0

    with open(TATOEBA_FILE, "r", encoding="utf-8") as f:
        for line in f:
            processed_bytes += len(line.encode("utf-8"))

            try:
                parts = line.strip().split("\t")
                if len(parts) < 2:
                    continue

                sentence_en = parts[0].strip()
                sentence_cn = parts[1].strip()

                if not sentence_en or not sentence_cn:
                    continue

                # 提取句子中的英文单词（简单实现）
                words = set()
                for word in re.findall(r"\b[a-zA-Z]+\b", sentence_en.lower()):
                    if len(word) > 2:
                        words.add(word)

                # 插入例句
                batch_examples.append((sentence_en, sentence_cn, ""))
                example_id = count + 1

                # 创建单词-例句映射
                for word in words:
                    batch_map.append((word, example_id))

                count += 1

                if len(batch_examples) >= batch_size:
                    cursor.executemany(
                        """
                        INSERT INTO tatoeba_examples (sentence_en, sentence_cn, tags)
                        VALUES (?, ?, ?)
                    """,
                        batch_examples,
                    )
                    cursor.executemany(
                        """
                        INSERT OR IGNORE INTO word_example_map (word_lower, example_id)
                        VALUES (?, ?)
                    """,
                        batch_map,
                    )
                    conn.commit()

                    if count % 10000 == 0:
                        progress = (processed_bytes / file_size) * 100
                        logger.info(f"  进度: {progress:.1f}% | 已处理: {count:,} 例句")

                    batch_examples = []
                    batch_map = []

            except Exception as e:
                logger.warning(f"解析行时出错: {e}")
                continue

    # 插入剩余数据
    if batch_examples:
        cursor.executemany(
            """
            INSERT INTO tatoeba_examples (sentence_en, sentence_cn, tags)
            VALUES (?, ?, ?)
        """,
            batch_examples,
        )
        cursor.executemany(
            """
            INSERT OR IGNORE INTO word_example_map (word_lower, example_id)
            VALUES (?, ?)
        """,
            batch_map,
        )
        conn.commit()

    conn.close()
    logger.info(f"Tatoeba 导入完成: {count:,} 例句")
    return True


def verify_tatoeba():
    """验证 Tatoeba 数据"""
    logger.info("验证 Tatoeba 数据...")

    # 检查文件是否存在
    if not TATOEBA_FILE.exists():
        logger.warning(f"Tatoeba 文件不存在: {TATOEBA_FILE}")
        return False

    # 验证文件格式
    try:
        with open(TATOEBA_FILE, "r", encoding="utf-8") as f:
            line_count = 0
            for i, line in enumerate(f):
                if i >= 5:
                    break
                parts = line.strip().split("\t")
                if len(parts) >= 2:
                    line_count += 1

        if line_count > 0:
            logger.info(f"Tatoeba 文件格式验证通过")
    except Exception as e:
        logger.warning(f"Tatoeba 文件验证失败: {e}")
        return False

    conn = sqlite3.connect(str(OPEN_DICT_DB))
    cursor = conn.cursor()

    # 检查例句数量
    cursor.execute("SELECT COUNT(*) FROM tatoeba_examples")
    example_count = cursor.fetchone()[0]

    # 检查映射数量
    cursor.execute("SELECT COUNT(*) FROM word_example_map")
    map_count = cursor.fetchone()[0]

    conn.close()

    if example_count > 0:
        logger.info(f"Tatoeba 数据库: {example_count:,} 例句, {map_count:,} 单词映射")
        return True
    else:
        logger.warning("Tatoeba 数据库为空")
        return False


def verify_ecdict():
    """验证 ECDICT 数据"""
    logger.info("验证 ECDICT 数据...")

    if not ECDICT_DB.exists():
        logger.warning(f"ECDICT 数据库不存在: {ECDICT_DB}")
        logger.info("ECDICT 提供基础中文翻译")
        logger.info("下载地址: https://github.com/skywind3000/ECDICT/releases")
        return False

    conn = sqlite3.connect(str(ECDICT_DB))
    cursor = conn.cursor()

    # 检查表是否存在
    cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='stardict'"
    )
    if not cursor.fetchone():
        logger.warning("ECDICT 数据库结构异常: 缺少 stardict 表")
        conn.close()
        return False

    cursor.execute("SELECT COUNT(*) FROM stardict")
    count = cursor.fetchone()[0]

    conn.close()

    if count > 0:
        logger.info(f"ECDICT: {count:,} 词目")
        return True
    else:
        logger.warning("ECDICT 数据库为空")
        return False


def print_summary():
    """打印摘要统计"""
    logger.info("\n" + "=" * 60)
    logger.info("开源词典数据设置摘要")
    logger.info("=" * 60)

    conn = sqlite3.connect(str(OPEN_DICT_DB))
    cursor = conn.cursor()

    # Wiktionary 统计
    cursor.execute("SELECT COUNT(*) FROM wiktionary")
    wik_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(DISTINCT word_lower) FROM wiktionary")
    wik_unique = cursor.fetchone()[0]

    # Tatoeba 统计
    cursor.execute("SELECT COUNT(*) FROM tatoeba_examples")
    tatoeba_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM word_example_map")
    map_count = cursor.fetchone()[0]

    # ECDICT 统计
    ecdict_count = 0
    if ECDICT_DB.exists():
        ecdict_conn = sqlite3.connect(str(ECDICT_DB))
        ecdict_cursor = ecdict_conn.cursor()
        ecdict_cursor.execute("SELECT COUNT(*) FROM stardict")
        ecdict_count = ecdict_cursor.fetchone()[0]
        ecdict_conn.close()

    conn.close()

    logger.info("\n数据状态:")
    logger.info(f"  Wiktionary 条目:  {wik_count:>10,} (唯一单词: {wik_unique:,})")
    logger.info(f"  Tatoeba 例句:     {tatoeba_count:>10,} (单词映射: {map_count:,})")
    logger.info(f"  ECDICT 词目:      {ecdict_count:>10,}")

    # 数据库大小
    db_size = OPEN_DICT_DB.stat().st_size / (1024 * 1024)
    logger.info(f"\n数据库大小: {db_size:.1f} MB")
    logger.info(f"数据库路径: {OPEN_DICT_DB}")

    # 文件状态
    logger.info("\n文件状态:")
    logger.info(
        f"  Wiktionary JSONL:  {'✓' if WIKTIONARY_JSONL.exists() else '✗'} {WIKTIONARY_JSONL.name}"
    )
    logger.info(
        f"  Tatoeba 文件:     {'✓' if TATOEBA_FILE.exists() else '✗'} {TATOEBA_FILE.name}"
    )
    logger.info(
        f"  ECDICT 数据库:    {'✓' if ECDICT_DB.exists() else '✗'} {ECDICT_DB.name}"
    )

    # 计算完成度
    total_items = wik_count + tatoeba_count + ecdict_count
    if total_items > 0:
        expected_total = 500000
        progress = min(100, int((total_items / expected_total) * 100))

        logger.info(f"\n总计: {total_items:,} 条目")
        logger.info(f"设置进度: {progress}%")

        if progress >= 80:
            logger.info("✓ 开源词典数据准备就绪！")
        else:
            logger.warning("设置未完成，可能缺少部分数据源")

    logger.info("=" * 60)


def main():
    """主函数"""
    logger.info("开始开源词典数据设置...")
    logger.info(f"项目根目录: {project_root}")

    try:
        # 1. 检查/创建表结构
        check_open_dict_database()

        # 2. 导入 Wiktionary 数据（如果文件存在）
        import_wiktionary()

        # 3. 导入 Tatoeba 数据（如果文件存在）
        import_tatoeba()

        # 4. 验证 Tatoeba 数据
        verify_tatoeba()

        # 5. 验证 ECDICT 数据
        verify_ecdict()

        # 6. 打印摘要统计
        print_summary()

        logger.info("\n开源词典数据设置完成！")
        logger.info("详细日志请查看: backend/scripts/setup_open_dictionary.log")

    except Exception as e:
        logger.error(f"设置过程中发生错误: {e}", exc_info=True)
        raise


if __name__ == "__main__":
    main()
