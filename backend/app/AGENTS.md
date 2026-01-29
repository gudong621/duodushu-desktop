# backend/app 知识库

**Generated:** 2026-01-27
**Commit:** 65fc3c2f
**Branch:** legacy-fixed
**模块评分:** 94/100 (核心业务层)

## OVERVIEW
FastAPI 应用的核心业务逻辑，负责路由分发、复杂业务流转、文档解析及数据持久化。

## STRUCTURE
```
backend/app/
├── routers/        # API 端点，按业务模块划分 (books, vocabulary, dictionary, etc.)
├── services/       # 业务服务层，封装 AI、词典、TTS、DB 等核心逻辑
├── parsers/        # 文档解析引擎，支持 PDF、EPUB、TXT 的结构化提取
├── models/         # SQLAlchemy 数据模型及数据库连接配置
└── utils/          # 工具函数，包含文本切片 (Chunker) 及优先级计算逻辑
```

## WHERE TO LOOK
| 模块 | 关键文件 | 核心职责 |
|------|----------|----------|
| **入口** | `main.py` | 应用初始化、CORS 配置、定时任务挂载 (APScheduler) |
| **数据库** | `models/database.py` | 统一的 `get_db` 依赖注入、BASE_DIR 定位 |
| **解析器** | `parsers/factory.py` | 根据文件后缀分发解析任务至对应 Parser |
| **词典逻辑** | `services/dict_service.py` | 串联 缓存 -> MDX -> AI -> 外部 API 的查询流水线 |
| **单词管理** | `routers/vocabulary.py` | 单词本核心业务，包含复杂的 priority_score 计算 |

## CONVENTIONS
- **异步任务**: 耗时操作（如书籍解析、FTS5 索引）必须使用 `BackgroundTasks` 或异步处理。
- **路径兼容**: 必须引用 `models.database.BASE_DIR` 构建路径，禁止硬编码绝对路径字符串。
- **依赖注入**: 数据库操作一律通过 `Depends(get_db)` 获取 Session。
- **词形还原**: 词典查询内置 `_get_lemma_candidates` 逻辑，支持自动尝试复数/过去式原型。

## ANTI-PATTERNS
- **DO NOT** 在 Router 函数内编写超过 20 行的业务逻辑 -> 必须移动至 `services/`。
- **DO NOT** 手动调用 `db.close()` -> 依赖注入会自动处理。
- **DO NOT** 在 `parsers/` 中处理 HTTP 响应或文件 IO -> 解析器应仅接收路径并返回数据对象。
- **DO NOT** 使用 `os.path` -> 优先使用 `pathlib.Path` 以确保 Windows 环境下的路径健壮性。
