"""
文本切片工具

用于将长文本分割成适合向量嵌入的小块
"""

import logging
from typing import List, Optional
import re

logger = logging.getLogger(__name__)


def chunk_text_by_sentences(
    text: str,
    max_chunk_size: int = 800,
    min_chunk_size: int = 400,
    overlap: int = 100,
) -> List[str]:
    """
    按句子边界进行文本切片

    Args:
        text: 输入文本
        max_chunk_size: 最大块大小（字符数）
        min_chunk_size: 最小块大小（字符数）
        overlap: 块之间的重叠字符数

    Returns:
        文本块列表
    """
    if not text or not text.strip():
        return []

    # 按句子分割（使用正则表达式识别句子结束）
    sentences = re.split(r"(?<=[.!?。！？])\s+", text)
    sentences = [s.strip() for s in sentences if s.strip()]

    logger.info(f"原始文本分割为 {len(sentences)} 个句子")

    # 合并句子到块
    chunks = []
    current_chunk = ""
    current_size = 0

    for sentence in sentences:
        sentence_length = len(sentence)

        # 如果添加这个句子会超过最大块大小
        if current_size + sentence_length > max_chunk_size and current_chunk:
            # 检查当前块是否超过最小大小
            if current_size >= min_chunk_size:
                chunks.append(current_chunk.strip())
                logger.debug(f"创建块 {len(chunks)}: {len(current_chunk)} 字符")
                current_chunk = sentence
                current_size = sentence_length
            else:
                # 继续添加到当前块
                current_chunk += " " + sentence
                current_size += sentence_length + 1  # +1 for the space
        else:
            # 添加到当前块
            if current_chunk:
                current_chunk += " " + sentence
                current_size += sentence_length + 1  # +1 for the space
            else:
                current_chunk = sentence
                current_size = sentence_length

    # 添加最后一个块（如果有足够的内容）
    if current_chunk and current_size >= min_chunk_size:
        chunks.append(current_chunk.strip())
        logger.debug(f"创建最终块 {len(chunks)}: {len(current_chunk)} 字符")

    logger.info(f"文本切片完成，生成 {len(chunks)} 个块")
    return chunks


def chunk_text_by_paragraphs(
    text: str,
    max_chunk_size: int = 800,
    overlap: int = 100,
) -> List[str]:
    """
    按段落边界进行文本切片

    Args:
        text: 输入文本
        max_chunk_size: 最大块大小（字符数）
        overlap: 块之间的重叠字符数

    Returns:
        文本块列表
    """
    if not text or not text.strip():
        return []

    # 按段落分割（多个换行符）
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    logger.info(f"原始文本分割为 {len(paragraphs)} 个段落")

    # 合并段落到块
    chunks = []
    current_chunk = ""
    current_size = 0

    for paragraph in paragraphs:
        para_length = len(paragraph)

        # 如果添加这个段落会超过最大块大小
        if current_size + para_length > max_chunk_size and current_chunk:
            chunks.append(current_chunk.strip())
            logger.debug(f"创建块 {len(chunks)}: {len(current_chunk)} 字符")

            # 处理重叠
            if overlap > 0 and current_size > overlap:
                # 从上一个块末尾取重叠部分
                overlap_text = (
                    current_chunk[-overlap:] if overlap < current_size else ""
                )
                current_chunk = overlap_text + "\n\n" + paragraph
                current_size = len(overlap_text) + para_length + 2  # +2 for \n\n
            else:
                current_chunk = paragraph
                current_size = para_length
        else:
            # 添加到当前块
            if current_chunk:
                current_chunk += "\n\n" + paragraph
                current_size += para_length + 2  # +2 for \n\n
            else:
                current_chunk = paragraph
                current_size = para_length

    # 添加最后一个块（如果有足够的内容）
    if current_chunk:
        chunks.append(current_chunk.strip())

    logger.info(f"文本切片完成，生成 {len(chunks)} 个块")
    return chunks


def chunk_text_by_tokens(
    text: str,
    max_tokens: int = 500,
    overlap: int = 50,
) -> List[str]:
    """
    按 Token 数量进行文本切片（简单估算）

    注意：这是一个粗略估算，实际 token 数可能有所不同

    Args:
        text: 输入文本
        max_tokens: 最大 Token 数
        overlap: 重叠 Token 数

    Returns:
        文本块列表
    """
    if not text or not text.strip():
        return []

    # 粗略估算：英文约 4 字符/token，中文约 2 字符/token
    # 这是一个近似值，实际应使用 tokenizers 库进行精确计算
    estimated_chars_per_token = 3

    max_chars = max_tokens * estimated_chars_per_token
    overlap_chars = overlap * estimated_chars_per_token

    logger.info(f"使用 Token 估算切片，最大字符数: {max_chars}")

    # 使用字符级切片作为近似
    return chunk_text_by_sentences(
        text, max_chunk_size=max_chars, overlap=overlap_chars
    )


def calculate_token_count(text: str) -> int:
    """
    估算文本的 Token 数量

    Args:
        text: 输入文本

    Returns:
        估算的 Token 数
    """
    # 粗略估算
    # 英文约 4 字符/token，中文约 2 字符/token
    chinese_chars = len(re.findall(r"[\u4e00-\u9fff]", text))
    english_chars = len(text) - chinese_chars

    return int(chinese_chars / 2 + english_chars / 4)


def smart_chunk(text: str, method: str = "sentences", **kwargs) -> List[str]:
    """
    智能文本切片（根据文本类型选择最佳方法）

    Args:
        text: 输入文本
        method: 切片方法 ("sentences", "paragraphs", "tokens")
        **kwargs: 传递给具体切片方法的参数

    Returns:
        文本块列表
    """
    if not text or not text.strip():
        return []

    logger.info(f"使用 {method} 方法进行文本切片")

    if method == "sentences":
        return chunk_text_by_sentences(text, **kwargs)
    elif method == "paragraphs":
        return chunk_text_by_paragraphs(text, **kwargs)
    elif method == "tokens":
        return chunk_text_by_tokens(text, **kwargs)
    else:
        logger.warning(f"未知的切片方法: {method}，使用默认的句子方法")
        return chunk_text_by_sentences(text, **kwargs)


def create_chunk_metadata(
    chunk_index: int,
    page_id: int,
    book_id: str,
    chunk_text: str,
) -> dict:
    """
    为文本块创建元数据

    Args:
        chunk_index: 块索引
        page_id: 页面 ID
        book_id: 书籍 ID
        chunk_text: 块文本

    Returns:
        元数据字典
    """
    return {
        "chunk_index": chunk_index,
        "page_id": page_id,
        "book_id": book_id,
        "token_count": calculate_token_count(chunk_text),
        "char_count": len(chunk_text),
        "method": "sentences",
        "chunk_text": chunk_text,  # 添加原始文本到元数据
    }
