# 日志系统使用说明

## 概述

项目使用统一的日志工具 (`frontend/src/lib/logger.ts`) 来管理所有控制台输出。

## 日志级别

- **debug**: 详细的调试信息（开发环境）
- **info**: 一般信息（默认）
- **warn**: 警告信息
- **error**: 错误信息
- **none**: 关闭所有日志（生产环境）

## 配置

在 `.env.local` 文件中设置日志级别：

```bash
# 开发环境：显示所有日志
NEXT_PUBLIC_LOG_LEVEL=debug

# 生产环境：仅显示警告和错误
NEXT_PUBLIC_LOG_LEVEL=warn

# 完全关闭日志
NEXT_PUBLIC_LOG_LEVEL=none
```

**注意**：
- 如果未设置 `NEXT_PUBLIC_LOG_LEVEL`，开发环境默认为 `info`，生产环境自动为 `none`
- 修改配置后需要重启开发服务器

## 使用方法

### 1. 在组件中导入 logger

```typescript
import { createLogger } from '../lib/logger';

// 创建模块专用的 logger
const log = createLogger('MyComponent');
```

### 2. 记录日志

```typescript
// 调试信息（仅在 debug 级别显示）
log.debug('Processing data', { id: 123, count: 5 });

// 一般信息（info 级别及以下显示）
log.info('User logged in', { userId: 'user_123' });

// 警告信息（warn 级别及以下显示）
log.warn('API rate limit approaching', { requests: 980, limit: 1000 });

// 错误信息（始终显示）
log.error('Failed to fetch data', error);
```

### 3. 直接使用全局 logger

```typescript
import { logger } from '../lib/logger';

logger.info('Application info', { version: '1.0.0' });
```

## 最佳实践

1. **使用正确的日志级别**：
   - `debug`: 详细的执行流程、变量值等调试信息
   - `info`: 重要的业务事件（用户操作、状态变更等）
   - `warn`: 潜在问题（API 限流、降级方案等）
   - `error`: 失败操作（请求失败、异常等）

2. **结构化日志数据**：
   ```typescript
   // ✅ 好的做法
   log.debug('Fetching user data', { userId, page: 1, limit: 20 });

   // ❌ 不推荐
   log.debug(`Fetching user data for user ${userId} page ${page} limit ${limit}`);
   ```

3. **避免敏感信息**：
   ```typescript
   // ❌ 错误：记录密码
   log.info('User login', { username, password });

   // ✅ 正确：不记录敏感信息
   log.info('User login', { username });
   ```

4. **移除调试代码**：
   - 开发完成后，将 `console.log` 改为使用 logger
   - 生产环境会自动过滤 debug 和 info 级别的日志

## 已迁移的文件

以下文件已使用新的日志系统：

- `frontend/src/app/read/[id]/page.tsx` - 阅读页面
- `frontend/src/components/AITeacherSidebar.tsx` - AI 老师侧边栏
- `frontend/src/components/EPUBReader.tsx` - EPUB 阅读器

## 问题排查

### 日志没有显示

1. 检查 `.env.local` 文件是否正确配置
2. 确保重启了开发服务器（`npm run dev`）
3. 检查日志级别是否设置过低

### 生产环境仍有大量日志

确保生产环境的 `NODE_ENV=production`，或显式设置 `NEXT_PUBLIC_LOG_LEVEL=none`。

## 迁移指南

将现有代码迁移到新日志系统：

```typescript
// 旧代码
console.log(`[MyComponent] Data received:`, data);
console.error('[MyComponent] Failed to fetch:', error);

// 新代码
const log = createLogger('MyComponent');
log.debug('Data received', { data });
log.error('Failed to fetch', error);
```
