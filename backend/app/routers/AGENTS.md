# Router 层规范 (backend/app/routers/)

FastAPI 路由入口，负责请求接入、参数校验与响应序列化。

## 核心准则 (Rules)
- **Thin Routers**: 单个路由函数严格限制在 20 行以内。
- **No Business Logic**: 严禁包含业务逻辑，必须分发至 `services/` 层。
- **Async Only**: 所有端点强制使用 `async def`，避免阻塞事件循环。
- **Pydantic Driven**: 必须定义 `response_model`，使用 Schema 验证入参。
- **Dependency Injection**: 统一通过 `Depends` 注入 DB Session 或认证状态。
- **BackgroundTasks**: 耗时操作（AI、解析、重型 IO）必须使用后台任务。

## 结构概览 (Structure)
- `books.py`: 书籍上传、解析状态、进度同步。
- `vocabulary.py`: 单词本 CRUD、优先级动态评分。
- `dictionary.py`: 词典查询聚合、样式/资源代理。
- `ai.py`: Gemini 交互、长文本翻译、FTS5 全文搜索 + AI 问答。
- `tts.py`: SSE 流式语音合成与本地缓存。

## 禁手 (Anti-patterns)
- **Direct SQL**: 严禁在 Router 中编写 SQL 或直接调用 ORM 执行语句。
- **Blocking Calls**: 严禁使用 `time.sleep` 或同步 `requests`，必须异步。
- **Hardcoded Response**: 严禁直接返回 `dict`，必须使用 Pydantic 模型。
- **Path Traversal**: 涉及文件路径的接口必须校验沙箱边界。

## 模板示例
```python
@router.post("/", response_model=ItemOut)
async def create_item(
    data: ItemIn, 
    db: AsyncSession = Depends(get_db),
    bt: BackgroundTasks = None
):
    return await service.create(db, data, bt)
```
