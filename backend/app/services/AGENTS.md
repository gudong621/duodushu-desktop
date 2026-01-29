# backend/app/services 知识库

## OVERVIEW
业务逻辑核心层。负责协调外部 API (Gemini/DeepSeek)、数据库事务、FTS5 全文搜索及媒体合成。

## STRUCTURE
- `dict_service.py`: 核心词典流水线 (Cache -> Local -> AI 降级)。
- `book_service.py`: 书籍异步解析与 FTS5 全文搜索索引。
- `gemini/deepseek_service.py`: LLM 集成，处理翻译、解析与对话。
- `tts_service.py`: 异步语音合成 (Edge-TTS)。

## CONVENTIONS
- **逻辑下沉**: 核心业务逻辑必须在此实现，确保高度可复用。
- **纯净数据**: 仅返回 Pydantic 模型或原始数据，严禁处理 HTTP Response。
- **优雅降级**: 必须处理外部 API 故障，支持多源 fallback (如 Gemini -> DeepSeek)。
- **原子事务**: 多表写操作需确保事务完整性，依赖注入 Session 生命周期。
- **非阻塞 IO**: 外部请求与文件操作必须使用 `async/await`，禁止阻塞。

## ANTI-PATTERNS
- **Sensitive Leak**: 严禁在日志中打印 API Key、密钥或用户敏感数据。
- **Manual DB Close**: 严禁手动关闭 `get_db` 注入的连接，由框架自动回收。
- **HTTP Coupling**: Service 层严禁导入 `FastAPI.Response` 或抛出 HTTP 异常。
- **Sync IO**: 异步函数内严禁使用 `time.sleep` 或同步 `requests` 库。

## UNIQUE STYLES
- **三级查询引擎**: 词典查询遵循 缓存 -> 本地索引 -> AI 链式逻辑。
- **全文搜索**: 基于 SQLite FTS5 的关键词全文搜索，支持文本片段高亮。
