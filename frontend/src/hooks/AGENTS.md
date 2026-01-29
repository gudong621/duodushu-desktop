# FRONTEND HOOKS KNOWLEDGE BASE (frontend/src/hooks/)

**Generated:** 2026-01-27
**Commit:** 65fc3c2f
**Branch:** legacy-fixed

## OVERVIEW
Zustand 状态管理与自定义 React Hooks，负责全局状态协调及跨组件逻辑复用。

## STRUCTURE
- `useGlobalTextSelection.ts` - 全局文本选择管理，处理划词交互
- `useDictionaryAudio.ts` - 词典发音音频播放，支持 Bing TTS

## CONVENTIONS
- **Zustand Store**: 状态管理使用 Zustand create，避免 Prop Drilling
- **自定义 Hook**: 逻辑复用使用 `use` 前缀命名
- **单例模式**: 资源密集型服务（如 TTS）使用单例模式

## ANTI-PATTERNS
- **DO NOT** 在 Hooks 中直接操作 DOM -> 使用 Ref 或事件回调
- **DO NOT** 过度使用 Context API -> 优先 Zustand Store
- **DO NOT** 在 Hooks 中定义组件 -> Hooks 仅返回数据和函数

## WHERE TO LOOK
| 任务 | 文件 | 功能 |
|------|------|------|
| 文本选择 | `useGlobalTextSelection.ts` | 划词工具栏触发、坐标计算 |
| 音频播放 | `useDictionaryAudio.ts` | 词典发音、Edge TTS |
