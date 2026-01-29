# Frontend Source Knowledge Base (frontend/src/)

**Generated:** 2026-01-27
**Commit:** 65fc3c2f
**Branch:** legacy-fixed

## OVERVIEW
Next.js 16 前端应用，负责沉浸式阅读、AI 辅助学习与用户交互。

## STRUCTURE
```
frontend/src/
├── app/                # App Router 路由 (read, vocabulary)
├── components/         # UI 组件 (Reader, Sidebar, Dictionary)
├── hooks/              # 自定义 Hooks (Selection, Audio)
├── lib/                # 工具库 (API client, TTS, Constants)
└── styles/             # 全局样式与词典专有 CSS (Sass + Tailwind)
```

## WHERE TO LOOK
| 任务 | 位置 | 备注 |
|------|----------|-------|
| 路由入口 | `app/page.tsx` | 首页与文件上传 |
| 阅读器逻辑 | `components/UniversalReader.tsx` | 统一调度 PDF/EPUB/TXT |
| API 调用 | `lib/api.ts` | Fetch 封装，相对路径 |
| 状态管理 | `hooks/` | Zustand Stores |
| 词典样式 | `styles/dictionary/` | CSS 注入适配 |

## CONVENTIONS
- **组件开发**: 函数式组件 + Hooks。优先 Tailwind CSS 4。
- **内联样式**: 仅 PDF/EPUB 动态定位允许使用，其他场景禁止。
- **API 交互**: 使用相对路径 `/api/...` 触发 Next.js Rewrites 代理。
- **状态管理**: 复杂状态使用 Zustand Store，避免 Prop Drilling。

## ANTI-PATTERNS
- **Window Location**: 使用 `useRouter` 而非 `window.location`。
- **硬编码 API**: 禁止拼接后端 URL，使用相对路径。
- **内联样式滥用**: 非阅读器定位场景严禁使用。
- **大型数据文件**: 词典数据文件禁止放入前端目录。

## COMMANDS
```bash
cd frontend && npm run dev      # 开发模式
cd frontend && npm run build    # 生产构建
cd frontend && npm run lint     # 代码检查
```
