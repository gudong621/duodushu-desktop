# FRONTEND COMPONENTS KNOWLEDGE BASE

**Generated:** 2026-01-23
**Focus:** React 19, Next.js, PDF/EPUB, Sidebars.

## OVERVIEW
核心 UI 组件库，负责多格式文档渲染、功能侧边栏及交互逻辑。

## STRUCTURE
- `UniversalReader.tsx`: 渲染调度中心，分发 PDF/EPUB/TXT。
- `PDFReader.tsx`: Canvas 渲染层 + 透明 TextLayer 交互层。
- `EPUBReader.tsx`: 基于 iframe/rendition 的交互式渲染。
- `*Sidebar.tsx`: 词典(Dictionary)、AI 教师、笔记、目录等侧边栏。
- `ContextAwareLayout.tsx`: 管理阅读器与侧边栏的响应式布局。
- `ClickableText.tsx`: 细粒度分词，支持单词/句子点选。

## CONVENTIONS
- **组件模式**: 函数式组件 + Hooks。
- **样式方案**: 强制使用 Tailwind CSS 4。逻辑与视图严格分离。
- **状态管理**: 统一使用 Zustand Store (hooks/)，禁止过度使用 Prop Drilling。
- **响应式**: 阅读器宽度应根据侧边栏展开状态动态挤压。

## ANTI-PATTERNS
- **INLINE STYLES**: 严禁 JSX 内联样式。**例外**: 仅限 PDF/EPUB 动态定位。
- **DIRECT DOM**: 禁止直接操作 DOM。必须使用 `window.getSelection()` 或 React Ref。
- **FAT COMPONENTS**: 单文件禁止超过 300 行。复杂逻辑需拆分为逻辑 Hook 或子组件。
- **STATE CLUTTER**: 严禁在容器组件中存储非必要的局部状态。

## WHERE TO LOOK
| 任务类型 | 核心路径 |
| :--- | :--- |
| 阅读器调度 | `UniversalReader.tsx` |
| PDF 渲染/交互 | `PDFReader.tsx` |
| 词典/AI 侧边栏 | `DictionarySidebar.tsx`, `AITeacherSidebar.tsx` |
| 选词坐标计算 | `SelectionToolbar.tsx` |

## MAINTENANCE
- 样式覆盖（如词典 HTML）需通过专门的 CSS 注入，严禁硬编码。
- 所有侧边栏组件应遵循 Container/Content 拆分原则以保持体积。
