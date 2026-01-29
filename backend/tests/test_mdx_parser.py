import pytest
import tempfile
from pathlib import Path
from app.services.mdx_parser import MDXParser


@pytest.fixture
def test_file(tmp_path: Path) -> Path:
    """创建测试文件 fixture"""
    return tmp_path / "test.mdx"


def test_parse_empty_header(test_file):
    """测试空 MDX 文件"""
    # 创建空 MDX 头部
    test_file.write_bytes(b"MIDX" + b"\x00\x00\x00\x00" + b"\x00" * 20)

    parser = MDXParser(test_file)
    entries = list(parser.parse())

    assert len(entries) == 0, "空文件应该没有词条"
