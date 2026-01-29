# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-27
**Commit:** 65fc3c2f
**Branch:** legacy-fixed
**Language:** 简体中文 (Simplified Chinese) - ALWAYS use this unless asked otherwise.

## OVERVIEW
沉浸式英语学习平台，全栈应用（FastAPI + Next.js 16）。核心功能包括 PDF/EPUB/TXT 阅读、三级词典查询（Cache->Local->AI）、FTS5 全文搜索 + AI 问答及 TTS 语音合成。

## STRUCTURE
```
./
├── backend/              # FastAPI 后端 (Python 3.10+)
│   └── app/
│       ├── routers/      # API 路由 (Thin layer)
│       │   └── ai.py     # AI 聊天 API (/api/ai/chat)
│       ├── services/     # 业务逻辑 (Thick layer)
│       │   └── deepseek_service.py  # AI 老师核心逻辑
│       ├── models/       # SQLAlchemy 2.0 ORM
│       ├── parsers/      # 文档解析 (Factory 模式)
│       └── utils/        # 通用工具 (文本切片, 优先级计算)
├── frontend/             # Next.js 16 前端 (Node 18+)
│   └── src/
│       ├── app/          # App Router 页面
│       │   └── read/[id]/page.tsx  # 阅读页面 (状态管理中心)
│       ├── components/   # UI 组件 (阅读器核心)
│       │   ├── UniversalReader.tsx   # 统一阅读器调度
│       │   ├── PDFReader.tsx         # PDF 阅读 + 文本提取
│       │   ├── EPUBReader.tsx        # EPUB 阅读 + 文本提取
│       │   └── AITeacherSidebar.tsx  # AI 老师侧边栏
│       ├── lib/          # API 客户端与工具库
│       └── hooks/        # Zustand 状态管理
├── data/                 # SQLite 数据库 (*.db)
├── dictionary/           # MDX/MDD 原始词典数据
├── dicts/                # 词典数据 (已导入)
└── docs/                 # 项目文档
```

## WHERE TO LOOK
| 任务 | 路径 | 备注 |
|------|----------|-------|
| **后端入口** | `backend/app/main.py` | App初始化, CORS, 定时任务 |
| **前端入口** | `frontend/src/app/page.tsx` | 首页 (书架) |
| **词典查询** | `backend/app/services/dict_service.py` | 核心三级查询逻辑 |
| **阅读器** | `frontend/src/components/UniversalReader.tsx` | PDF/EPUB/TXT 统一调度 |
| **AI老师前端** | `frontend/src/components/AITeacherSidebar.tsx` | 侧边栏 + API 调用 |
| **AI老师后端** | `backend/app/routers/ai.py` | 意图识别 + 路由分发 |
| **AI核心服务** | `backend/app/services/deepseek_service.py` | DeepSeek API 调用 |
| **阅读页面** | `frontend/src/app/read/[id]/page.tsx` | 页面状态管理中心 |
| **API定义** | `backend/app/routers/` | 路由定义 (Pydantic Schema) |
| **API调用** | `frontend/src/lib/api.ts` | 前端 Fetch 封装 |
| **数据库** | `backend/app/models/database.py` | Session, BASE_DIR 配置 |
| **日志系统** | `frontend/src/lib/logger.ts` | 统一的日志工具，支持环境变量控制 |

## CONVENTIONS
### 全局
- **语言**: 必须使用 **简体中文**。
- **路径**: 后端严禁 `os.path`，必须使用 `pathlib.Path`。
- **安全**: 严禁提交 `.env`、密钥、数据库文件。

### Backend (FastAPI)
- **架构**: Router (校验/序列化) -> Service (业务) -> Model (数据)。Router 逻辑 < 20 行。
- **DB**: SQLAlchemy 2.0 Async。依赖注入 `Depends(get_db)`。严禁手动 `db.close()`。
- **异步**: 耗时操作 (AI, 解析) 必须用 `BackgroundTasks`。
- **配置**: 优先读取环境变量，避免硬编码。
- **API参数**: Pydantic 模型字段必须使用 **snake_case** (如 `page_content`)。

### Frontend (Next.js)
- **框架**: Next.js 16 App Router, React 19。
- **样式**: Tailwind CSS 4。禁止内联样式 (PDF动态定位除外)。
- **状态**: 复杂状态使用 Zustand，避免 Prop Drilling。
- **API**: 所有请求通过 `/api/` 代理转发，禁止硬编码后端端口。
- **API请求体**: 发送到后端的 JSON 字段必须使用 **snake_case** (如 `page_content: pageContent`)。
- **日志**: 使用 `lib/logger.ts` 统一日志工具，禁止直接使用 `console.log`。
  - 开发环境：`NEXT_PUBLIC_LOG_LEVEL=debug` 或 `info`（默认）
  - 生产环境：自动关闭或设置为 `warn`/`error`

## DATA FLOW: AI Teacher
```
阅读器组件 (PDFReader/EPUBReader)
    │
    ├─ onContentChange(text) ──────────────────────┐
    │                                              │
    ▼                                              ▼
ReaderPage (page.tsx)                    visibleContent 状态
    │                                              │
    ├─ isContentLoading 状态 ──────────────────────┤
    │                                              │
    ▼                                              ▼
AITeacherSidebar ◄───────────────── pageContent prop
    │
    ├─ 发送请求 (snake_case 参数)
    │   { page_content, current_page, book_title, book_id }
    │
    ▼
/api/ai/chat (FastAPI)
    │
    ├─ classify_user_intent() 意图识别
    │
    ├─ language_learning: deepseek_service.chat_with_teacher()
    └─ knowledge_retrieval: knowledge_based_chat_fts5()
```

## ANTI-PATTERNS (THIS PROJECT)
- **Fat Routers**: 路由层包含业务逻辑 -> 移至 Services。
- **Direct SQL**: Router 中写 SQL 字符串 -> 使用 ORM 方法。
- **Sync IO**: 在 `async def` 中使用同步文件/DB 操作 -> 使用 `aiofiles`/`run_in_threadpool`。
- **Root Clutter**: 根目录放置非配置文件 -> 移至 `scripts/` 或 `backend/`。
- **Window Location**: 前端使用 `window.location` 跳转 -> 使用 `useRouter`。
- **CamelCase API**: 前端发送 camelCase 参数到后端 -> **必须转换为 snake_case**。
- **Console Logs**: 前端使用 `console.log/warn/error` -> **必须使用 `lib/logger.ts`**。
  ```typescript
  // ❌ 错误
  fetch('/api/ai/chat', { body: JSON.stringify({ pageContent, currentPage }) })

  // ✅ 正确
  fetch('/api/ai/chat', { body: JSON.stringify({ page_content: pageContent, current_page: currentPage }) })
  ```

## KNOWN ISSUES & FIXES
| 问题 | 原因 | 修复 |
|------|------|------|
| AI老师收不到页面内容 | 前端 camelCase / 后端 snake_case 不匹配 | 统一使用 snake_case |
| 翻页后立即点AI报错 | 异步文本提取未完成 | 添加 `isContentLoading` 状态 |

## COMMANDS
```bash
# Backend
cd backend && python -m uvicorn app.main:app --reload
cd backend && pytest tests/test_vocabulary.py  # 单测

# Frontend
cd frontend && npm run dev
cd frontend && npm run lint

# Maintenance
python build_mdx_index.py  # 重建词典索引
```
