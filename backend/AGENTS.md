# Backend Knowledge Base

**Generated:** 2026-01-27
**Commit:** 65fc3c2f
**Branch:** legacy-fixed
**Module Score:** 94/100 (Core Service)

## OVERVIEW
负责书籍解析（PDF/EPUB/TXT）、词典索引查询、AI 辅助学习、TTS 语音合成及单词本管理的全栈后端核心。

## STRUCTURE
```
backend/
├── app/                  # FastAPI 核心逻辑
│   ├── routers/          # API 路由 (ai, books, dict, tts, vocab)
│   ├── services/         # 业务逻辑 (核心是 dict_service, book_service)
│   ├── models/           # SQLAlchemy 2.0 模型与 DB 配置
│   └── parsers/          # 文档解析引擎 (Factory 模式)
├── data/                 # SQLite 数据库文件 (*.db)
├── migrations/           # 数据库结构变更脚本
├── tests/                # 系统集成测试
└── uploads/              # 用户书籍、封面及音频缓存 (gitignore 忽略)
```

## WHERE TO LOOK
| 模块 | 关键文件 | 职责 |
|------|----------|------|
| **主入口** | `app/main.py` | 应用初始化、CORS 配置、定时任务挂载 |
| **数据库** | `app/models/database.py` | `BASE_DIR` 定义与 `get_db` 依赖注入 |
| **词典流水线** | `app/services/dict_service.py` | 串联 缓存 -> 本地 MDX -> AI 的查询逻辑 |
| **异步解析** | `app/services/book_service.py` | 处理 `BackgroundTasks` 触发的书籍结构化提取 |
| **路径解析** | `app/parsers/factory.py` | 根据文件扩展名自动选择解析器 |

## CONVENTIONS
- **路径处理**: 必须使用 `pathlib.Path`。通过 `from .models.database import BASE_DIR` 获取项目根路径，严禁硬编码。
- **数据验证**: 强制使用 Pydantic 2.0 定义 Request/Response Schema。
- **数据库操作**: 路由层仅通过 `Depends(get_db)` 获取 session，业务逻辑必须下沉到 `services/`。
- **并发处理**: 耗时任务（如 LLM 调用、书籍解析）必须使用 `BackgroundTasks` 以防阻塞。

## ANTI-PATTERNS
- **DO NOT** 在根目录 `backend/` 创建 `test_*.py` 或 `debug_*.py` 脚本（应归类至 `tests/`）。
- **DO NOT** 在 Router 中直接编写 SQL 查询 -> 使用 `models.py` 中的模型及 ORM。
- **DO NOT** 提交 `*.log` 或调试用的 `*.txt` 文件到仓库。
- **DO NOT** 手动关闭数据库连接 -> 由 FastAPI 依赖注入生命周期自动管理。

## UNIQUE STYLES
- **三级查询引擎**: 词典查询遵循 `Cache -> Local (MDX/ECDICT) -> AI (Gemini)` 的降级策略。
- **单词优先级**: 系统通过 `APScheduler` 定时触发 `priority_score` 计算，综合考虑查询频次与 AI 反馈。
- **Windows 兼容层**: 包含对 `nul` 设备名的防护及相对路径 Fallback 机制，确保跨平台运行稳定。
