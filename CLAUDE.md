# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Output Language Specification

所有回复、思考过程、计划、总结、解释、代码注释，必须全部使用简体中文。
严禁使用英文，除非是代码中的关键词、变量名、库名或不可翻译的专有名词。
回复时优先使用自然、流畅的中文表达，确保易懂。

## Project Overview

**Duodushu Desktop** (多读书桌面版) 是一款本地优先且支持绿色便携的沉浸式英语学习工作站。

**技术栈**:
- **Electron** - 桌面应用外壳和进程管理
- **Next.js 16** - 前端 UI (React 19, 静态导出模式)
- **Python FastAPI** - 后端服务 (文档处理、TTS、AI、词典查询)

**核心功能**: PDF/EPUB/TXT 阅读、三级词典查询、全文搜索、AI 问答、TTS 语音合成

## Architecture

**三进程桌面应用**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Main Process                     │
│                  (electron/main.ts)                          │
│  - 启动 Python 后端 (端口 8000)                             │
│  - 创建浏览器窗口                                            │
│  - 加载 Next.js 应用                                        │
│  - 管理便携模式数据目录                                      │
└─────────────────────────────────────────────────────────────┘
         ↓                              ↓
┌─────────────────────┐      ┌──────────────────────────────────┐
│  Python Backend     │      │     Next.js Frontend             │
│  (FastAPI)          │◄────►│  (Static Export)                  │
│  Port: 8000         │ HTTP │  - 无服务端路由                  │
│                    │      │  - 所有 API 调用到 :8000         │
│  - 书籍处理        │      │  - PDF/EPUB/TXT 阅读器           │
│  - TTS/AI 服务     │      │  - 词典查询                      │
│  - 词汇管理        │      │                                  │
└─────────────────────┘      └──────────────────────────────────┘
```

**关键特点**:
- Next.js 使用 `output: 'export'` - 纯静态文件，无 API 路由
- Python 后端作为独立子进程运行
- 前端通过 HTTP 与后端通信 (localhost:8000)

## Important File Locations

| 用途 | 路径 |
|------|------|
| **Electron 入口** | `electron/main.ts` - 启动后端、创建窗口、管理便携模式 |
| **前端入口** | `frontend/src/app/page.tsx` - 首页（书架） |
| **后端入口** | `backend/app/main.py` - FastAPI 应用初始化 |
| **后端启动器** | `backend/run_backend.py` - CLI 入口，支持 `--port` 和 `--data-dir` |
| **构建配置** | `package.json` - Electron Builder 配置和构建脚本 |
| **前端配置** | `frontend/next.config.ts` - 静态导出模式配置 |
| **PyInstaller 配置** | `backend/backend.spec` - Python 打包配置 |
| **API 客户端** | `frontend/src/lib/api.ts` - 前端 API 包装器 |

## Backend Architecture

**FastAPI** + SQLAlchemy 2.0 Async，遵循 Router → Service → Model 模式：

- **Routers** (`backend/app/routers/`): 薄层，用于参数校验和序列化 (< 20 行)
- **Services** (`backend/app/services/`): 业务逻辑（厚层）
- **Models** (`backend/app/models/`): SQLAlchemy ORM
- **Parsers** (`backend/app/parsers/`): 文档解析（工厂模式）

**关键约定**:
- 使用 `pathlib.Path` 而不是 `os.path`
- 使用 `Depends(get_db)` 进行数据库会话依赖注入（禁止手动 `db.close()`）
- 耗时操作（AI、解析）必须使用 `BackgroundTasks`
- API 参数使用 **snake_case** (Pydantic 模型)

## Frontend Architecture

**Next.js 16** + App Router + React 19 + Tailwind CSS 4：

- **App Router** (`frontend/src/app/`): 页面和布局
- **Components** (`frontend/src/components/`): UI 组件
- **Lib** (`frontend/src/lib/`): API 客户端、工具函数
- **Hooks**: Zustand 状态管理（避免 Prop Drilling）

**关键约定**:
- 所有 API 请求通过 `lib/api.ts` 代理转发
- 使用 `lib/logger.ts` 记录日志（禁止 `console.log`）
- 发送到后端的 JSON 字段必须使用 **snake_case** (如 `page_content: pageContent`)
- 纯静态导出，无服务端路由

## Development Commands

```bash
# 安装依赖
npm install                           # 根目录依赖
cd frontend && npm install            # 前端依赖
cd backend && pip install -r requirements.txt  # 后端依赖

# 开发模式（启动所有三个进程）
npm run dev                           # 启动前端 + Electron

# 单独启动各模块
cd frontend && npm run dev            # 前端开发服务器 (端口 3000)
cd backend && python -m uvicorn app.main:app --reload  # 后端 (端口 8000)

# 构建
npm run build                         # 完整构建
npm run build:frontend                # 前端构建
npm run build:backend                 # 后端构建
npm run build:electron                # Electron 编译
npm run package                       # 应用打包

# 测试
cd backend && pytest                  # 运行所有测试
cd backend && pytest tests/test_vocabulary.py  # 运行特定测试

# 代码检查
cd frontend && npm run lint           # ESLint 检查
```

## Data Storage

应用支持三种数据存储模式：

| 模式 | 数据位置 | 使用场景 |
|------|---------|---------|
| **开发环境** | `backend/data/` | 本地开发调试 |
| **标准模式** | `C:\Users\{username}\AppData\Roaming\duodushu-desktop\` | 用户安装应用 |
| **便携模式** | exe 同级的 `data/` 目录 | 免安装、U 盘运行 |

**详见**: [DATA_STORAGE.md](./docs/DATA_STORAGE.md)

## Common Tasks

- **添加新 API 端点**: 在 `backend/app/routers/` 创建 Pydantic 模型，添加 service 方法，更新 `frontend/src/lib/api.ts`
- **添加新页面**: 添加到 `frontend/src/app/` (Next.js App Router)
- **修改构建输出**: 编辑 `package.json` (Electron Builder 配置) 或 `frontend/next.config.ts`
- **更改数据目录**: 修改 `electron/main.ts` (便携模式检测) 和后端配置
- **调试后端**: 查看生成的 Python 进程日志或直接运行 `backend/run_backend.py`
- **调试前端**: 使用 React DevTools，查看 `electron/main.ts` 中的开发 URL 配置

## Documentation

完整文档见 [README.md](./README.md)

- **[开发指南](./docs/DEVELOPMENT.md)** - 环境设置和开发命令
- **[部署指南](./docs/DEPLOYMENT.md)** - 构建、打包和便携模式
- **[数据存储](./docs/DATA_STORAGE.md)** - 数据存储位置和迁移
- **[API 文档](./docs/API.md)** - 后端 API 参考
- **[代码约定](./docs/CONVENTIONS.md)** - 代码规范和最佳实践
- **[故障排查](./docs/TROUBLESHOOTING.md)** - 常见问题和解决方案
- **[技术架构](./docs/桌面端_技术架构文档.md)** - 系统设计
- **[产品需求](./docs/桌面端_PRD.md)** - 功能需求和版本规划
