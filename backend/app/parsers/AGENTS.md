# backend/app/parsers 知识库

**生成的日期:** 2026-01-20
**模块评分:** 96/100 (核心解析引擎)

## OVERVIEW
文档解析器模块，负责将 PDF/EPUB/TXT 等不同格式的文档统一转换为结构化的 JSON 数据（包含元数据、文本及单词坐标）。

## STRUCTURE
```
backend/app/parsers/
├── base.py         # 解析器基类，定义统一接口 BaseParser
├── factory.py      # 解析器工厂，根据文件后缀分发任务
├── pdf_parser.py   # PDF 解析器 (PyMuPDF / fitz)
├── epub_parser.py  # EPUB 解析器 (ebooklib + BeautifulSoup)
└── txt_parser.py   # 纯文本解析器 (多编码支持)
```

## WHERE TO LOOK
| 格式 | 解析器文件 | 核心技术 / 特点 |
|------|------------|-----------------|
| **PDF** | `pdf_parser.py` | 使用 `fitz.TEXT_PRESERVE_WHITESPACE` 及 `rawdict` 提取字符级坐标；支持多栏聚类算法。 |
| **EPUB** | `epub_parser.py` | `ebooklib` 提取章节，`BeautifulSoup` 清洗 HTML；支持 TOC 目录提取及多种封面发现策略。 |
| **TXT** | `txt_parser.py` | 自动尝试 `utf-8`, `gbk` 等多种编码；按 `\n\n` 段落进行分页，模拟单词坐标。 |
| **入口** | `factory.py` | `ParserFactory.get_parser(path)` 静态方法。 |

## CONVENTIONS
- **统一接口**: 所有解析器必须继承 `BaseParser` 并实现 `parse(file_path, book_id)`。
- **返回格式**: 必须返回包含 `title`, `author`, `pages` (List[Dict]), `cover_image` 的字典。
- **坐标数据**: `words_data` 必须包含 `text`, `x`, `y`, `width`, `height`，用于前端点词交互。
- **资源路径**: 解析出的封面应保存至书籍所在目录下的 `covers/` 文件夹。

## UNIQUE STYLES
- **PDF 智能列检测**: 通过 `_detect_columns` 方法对块中心 X 坐标进行聚类，解决双栏排版阅读顺序问题。
- **EPUB 封面策略**: 采用元数据查询、ID 匹配、文件名关键字及顺序兜底的四级发现机制。
- **TXT 分页逻辑**: 将空行分隔的段落映射为独立页面，保持轻量级解析体验。
- **字符级精度**: PDF 解析器通过遍历 `chars` 列表重建单词，确保在艺术排版（如首字下沉）下的点击准确性。
