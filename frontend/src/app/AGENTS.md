# APP ROUTER KNOWLEDGE BASE (frontend/src/app)

**Generated:** 2026-01-21
**Branch:** main

## OVERVIEW
Next.js App Router 页面层，负责定义应用路由结构、页面交互逻辑及数据获取入口。

## STRUCTURE
```
app/
├── layout.tsx             # 全局根布局 (字体、全局样式)
├── page.tsx               # 首页 (书架、书籍上传与管理)
├── read/
│   └── [id]/page.tsx      # 阅读器主页 (PDF/EPUB/TXT 渲染与 AI 辅助)
└── vocabulary/
    ├── page.tsx           # 生词本列表 (搜索、排序、高优先级词)
    ├── [id]/page.tsx      # 单词详情页 (AI 分析、上下文例句)
    └── review/page.tsx    # 单词复习模式 (闪卡交互、掌握度更新)
```

## WHERE TO LOOK
| 路由 | 文件 | 职责 |
|------|------|------|
| `/` | `page.tsx` | 书架展示，处理书籍上传及状态轮询 |
| `/read/[id]` | `read/[id]/page.tsx` | 核心阅读交互，集成侧边栏与划词工具栏 |
| `/vocabulary` | `vocabulary/page.tsx` | 生词管理中心，展示单词掌握度与学习统计 |
| `/vocabulary/[id]` | `vocabulary/[id]/page.tsx` | 单词深挖，支持例句提取与 AI 解析 |
| `/vocabulary/review` | `vocabulary/review/page.tsx` | 算法驱动的复习界面，基于优先级分数排序 |

## CONVENTIONS
- **客户端优先**: 核心页面均需声明 `"use client"` 以支持复杂的划词交互与状态管理。
- **参数获取**: 统一使用 `useParams()` 获取路由动态 ID，`useSearchParams()` 处理阅读进度或分页。
- **API 调用**: 必须使用相对路径（如 `/api/books`）通过 Proxy 转发，禁止硬编码域名。
- **状态同步**: 页面间状态优先通过 URL Params 同步，核心业务状态使用 Zustand 钩子。

## ANTI-PATTERNS
- **DO NOT** 在此目录外创建页面路由。
- **DO NOT** 在页面组件中直接编写复杂的业务逻辑，应抽离至 `components/` 或 `hooks/`。
- **DO NOT** 在高度交互页面（如阅读器）中使用服务端渲染 (SSR) 获取动态数据。
- **DO NOT** 使用 `window.location` 进行导航，必须使用 `next/navigation` 的 `useRouter`。
- **DO NOT** 忽略 `loading.tsx` 或局部 Loading 状态，导致页面切换时出现白屏。
