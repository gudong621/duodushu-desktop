# FRONTEND LIB KNOWLEDGE BASE (frontend/src/lib/)

## OVERVIEW
工具库目录，包含 API 客户端、通用工具函数和共享类型定义。严禁包含 UI 逻辑。

## CORE MODULES
- **api.ts**: 核心 API 客户端。封装后端交互 fetch 请求，提供类型安全。
- **epubCache.ts**: EPUB 文件与阅读进度的 IndexedDB 缓存实现。
- **BingSpeechService.ts**: 基于 WebSocket 的 Edge TTS 语音合成服务单例。
- **logger.ts**: 统一的日志工具。支持日志级别控制（debug/info/warn/error/none），自动根据环境过滤日志。

## CONVENTIONS
- **类型化 Fetch**: 所有请求必须定义 Request/Response 接口，确保类型安全。
- **错误处理**: Fetch 异常必须抛出包含明确信息的 `Error`。
- **纯函数优先**: 工具函数应尽量保持无副作用，逻辑原子化。
- **超时中断**: 耗时请求（如翻译）建议支持 `AbortController` 中断。

## ANTI-PATTERNS
- **硬编码 URL**: 严禁直接写入 `http://localhost:8000`。
  - 必须使用相对路径 `/api/...` (由 Next.js Rewrite 转发) 或环境变量。
- **UI 逻辑泄露**: 严禁在此处使用 React Hooks (`useState` 等) 或 UI 组件。
- **冗余逻辑**: `lib` 仅存放底层工具，复杂业务逻辑应移至 `hooks` 或 `services`。

## BEST PRACTICES
- **模块化**: 按功能（Book, Vocabulary, Dict）组织 API 导出函数。
- **缓存处理**: 针对易过期数据请求可添加 `_t` 时间戳防止缓存。
- **Sanitization**: 在发送 API 请求前，在 `lib` 层完成必要的数据清洗（如 TTS 文本过滤）。
