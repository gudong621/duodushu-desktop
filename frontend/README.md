# 多读书 - duodushu (Frontend)

多读书（duodushu）前端，基于 Next.js 16 和 React 19。

## 技术栈

- **框架**: Next.js 16 (App Router) + React 19
- **样式**: Tailwind CSS 4
- **状态管理**: Zustand
- **文档渲染**:
  - PDF: react-pdf
  - EPUB: epub.js
  - TXT: 原生渲染

## 开发设置

### 环境变量

创建 `.env.local` 文件：

```bash
# 后端 API 地址（可选，默认 http://localhost:8000）
NEXT_PUBLIC_API_URL=http://localhost:8000

# 日志级别（可选，开发环境默认 info，生产环境默认 none）
# 可选值: debug | info | warn | error | none
NEXT_PUBLIC_LOG_LEVEL=info
```

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 运行。

## 可用命令

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 运行生产构建
npm start

# 代码检查
npm run lint
```

## 项目结构

```
frontend/
├── src/
│   ├── app/                # App Router 页面
│   │   ├── page.tsx       # 首页（书架）
│   │   └── read/[id]/     # 阅读页面
│   ├── components/         # React 组件
│   │   ├── UniversalReader.tsx    # 阅读器调度
│   │   ├── PDFReader.tsx         # PDF 阅读器
│   │   ├── EPUBReader.tsx        # EPUB 阅读器
│   │   ├── AITeacherSidebar.tsx   # AI 老师侧边栏
│   │   └── ...                   # 其他组件
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   ├── api.ts         # API 客户端
│   │   ├── logger.ts      # 日志工具
│   │   └── ...           # 其他工具
│   └── styles/             # 全局样式
├── public/                # 静态资源
├── next.config.ts         # Next.js 配置
└── eslint.config.mjs      # ESLint 配置
```

## 核心功能

### 1. 阅读器
- 支持 PDF、EPUB、TXT 格式
- 实时文本提取与高亮
- 选词查词与划词功能
- 阅读进度自动保存

### 2. AI 老师
- 意图识别（语言学习 vs 知识检索）
- 上下文感知的问答
- 推荐问题生成
- 来源引用跳转

### 3. 词典
- 三级查询（缓存 -> 本地 -> AI）
- 多词典支持（牛津、朗文、柯林斯等）
- 上下文例句展示
- 生词收藏与管理

### 4. 笔记系统
- 划词高亮
- 评论添加
- 笔记管理

## 日志系统

项目使用统一的日志工具 `lib/logger.ts`，支持通过环境变量控制日志级别：

```typescript
// 在组件中使用
import { createLogger } from '../lib/logger';

const log = createLogger('MyComponent');

log.debug('调试信息', { data });
log.info('一般信息');
log.warn('警告信息');
log.error('错误信息', error);
```

### 日志级别

- `debug`: 详细调试信息
- `info`: 一般信息（默认）
- `warn`: 警告信息
- `error`: 错误信息
- `none`: 关闭所有日志

## 开发规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Tailwind CSS 进行样式开发
- 状态管理优先使用 Zustand
- 禁止直接使用 `console.log`，必须使用 `lib/logger.ts`
- API 请求通过相对路径 `/api/...` 转发

## API 代理

前端通过 Next.js Rewrite 代理所有后端请求：

```
前端请求: /api/books/:id
实际转发: http://localhost:8000/api/books/:id
```

配置在 `next.config.ts` 中。

## 相关文档

- [日志系统使用说明](./docs/LOGGING.md)
- [前端开发规范](./AGENTS.md)
- [项目总体文档](../AGENTS.md)
