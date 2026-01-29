# FRONTEND KNOWLEDGE BASE (frontend/)

**Generated:** 2026-01-27
**Commit:** 65fc3c2f
**Branch:** legacy-fixed

## OVERVIEW
Next.js 16 前端应用入口，负责沉浸式阅读交互与 AI 辅助展示。

## STRUCTURE
```
frontend/
├── src/
│   ├── app/                # App Router 路由 (read, vocabulary)
│   ├── components/         # UI 组件 (Reader, Sidebar, Dictionary)
│   ├── hooks/              # 自定义 Hooks (Selection, Audio)
│   ├── lib/                # 工具库 (API client, TTS, Constants)
│   └── styles/             # 全局样式与词典专有 CSS (Sass + Tailwind)
├── public/                 # 静态资源
├── next.config.ts          # Next.js 配置 (API Proxy)
└── eslint.config.mjs       # ESLint 规则配置
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| 路由入口 | `src/app/page.tsx` | 首页与文件上传入口 |
| 阅读器逻辑 | `src/components/UniversalReader.tsx` | 统一调度 PDF/EPUB/TXT |
| API 代理 | `next.config.ts` | `/api/:path*` 转发至后端 8000 端口 |
| 状态管理 | `src/hooks/` | 优先使用 Zustand 组织状态（开发约定） |
| 样式覆盖 | `src/styles/dictionary/` | 针对 MDX 词典内容的 CSS 注入 |
| 日志工具 | `src/lib/logger.ts` | 统一的日志系统，支持环境变量控制日志级别 |

## CONVENTIONS
- **组件开发**: 优先使用 Tailwind CSS 4 进行样式定义。
- **内联样式**: `react/no-inline-styles` 已在 ESLint 中禁用，仅允许在 PDF 阅读器等需要动态定位的组件中使用。
- **API 交互**: 必须使用相对路径 `/api/...` 以触发 Next.js Rewrites 代理，避免跨域问题。
- **状态管理**: 核心状态推荐使用 Zustand 进行管理。
- **词典适配**: 词典内容样式通过注入专用 CSS 文件（如 `longman.css`）实现，而非修改组件。
- **日志规范**: 使用 `lib/logger.ts` 记录日志，禁止直接使用 `console.log`。
  - 调试信息使用 `log.debug()`
  - 一般信息使用 `log.info()`
  - 警告使用 `log.warn()`
  - 错误使用 `log.error()`
  - 通过 `NEXT_PUBLIC_LOG_LEVEL` 环境变量控制日志级别

## ANTI-PATTERNS
- **DO NOT** 在 `src/app/` 以外的地方创建页面路由（遵循 App Router 规范）。
- **DO NOT** 手动拼接带域名的 API URL（由 Proxy 统一处理）。
- **DO NOT** 在非交互定位场景下滥用内联样式。
- **DO NOT** 将大型词典数据文件（.mdx/.mdd）放入前端目录。
- **DO NOT** 直接使用 `console.log/warn/error`，必须使用 `lib/logger.ts` 提供的日志工具。

## COMMANDS
```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 代码检查
npm run lint
```
