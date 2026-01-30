# 代码约定

**最后更新**: 2026-01-30

本文档定义项目的代码规范、架构模式和反模式。

## 1. 全局约定

### 语言
- **必须使用简体中文**进行注释、文档和提交信息
- 代码变量名、函数名使用英文

### 路径处理
- **后端严禁使用 `os.path`**，必须使用 `pathlib.Path`
- 示例：
  ```python
  # ❌ 错误
  path = os.path.join(base_dir, 'data', 'app.db')

  # ✅ 正确
  from pathlib import Path
  path = Path(base_dir) / 'data' / 'app.db'
  ```

### 安全
- **严禁提交** `.env`、密钥、数据库文件
- 使用 `.gitignore` 排除敏感文件
- API Key 必须加密存储

## 2. Backend (FastAPI)

### 架构分层
遵循 **Router → Service → Model** 的三层架构：

| 层级 | 职责 | 代码行数 |
|------|------|--------|
| **Router** | 参数校验、序列化、HTTP 响应 | < 20 行 |
| **Service** | 业务逻辑、数据处理 | 任意 |
| **Model** | 数据库操作、ORM | 任意 |

### Router 层示例
```python
# ✅ 正确：Router 层简洁
@router.post("/books")
async def create_book(
    book_data: BookCreate,
    db: AsyncSession = Depends(get_db)
):
    book = await book_service.create_book(book_data, db)
    return {"id": book.id, "title": book.title}

# ❌ 错误：Router 层包含业务逻辑
@router.post("/books")
async def create_book(book_data: BookCreate, db: AsyncSession = Depends(get_db)):
    # 业务逻辑不应该在这里
    book = Book(**book_data.dict())
    db.add(book)
    await db.commit()
    return book
```

### 数据库操作
- 使用 **SQLAlchemy 2.0 Async**
- 依赖注入 `Depends(get_db)`
- **严禁手动 `db.close()`**，由依赖注入管理

```python
# ✅ 正确
async def get_books(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Book))
    return result.scalars().all()

# ❌ 错误
async def get_books(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Book))
    db.close()  # 不要手动关闭
    return result.scalars().all()
```

### 异步操作
- 耗时操作（AI、文件解析）**必须使用 `BackgroundTasks`**
- 不要在请求处理中阻塞

```python
# ✅ 正确
@router.post("/parse-book")
async def parse_book(file: UploadFile, background_tasks: BackgroundTasks):
    background_tasks.add_task(parse_file_task, file.filename)
    return {"status": "parsing"}

# ❌ 错误
@router.post("/parse-book")
async def parse_book(file: UploadFile):
    # 这会阻塞请求
    parse_file(file)
    return {"status": "done"}
```

### API 参数
- Pydantic 模型字段**必须使用 snake_case**
- 示例：
  ```python
  # ✅ 正确
  class BookCreate(BaseModel):
      book_title: str
      author_name: str
      page_count: int

  # ❌ 错误
  class BookCreate(BaseModel):
      bookTitle: str
      authorName: str
      pageCount: int
  ```

### 配置管理
- 优先读取环境变量
- 避免硬编码
- 使用 `pydantic_settings.BaseSettings`

```python
# ✅ 正确
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "sqlite:///app.db"
    api_key: str = ""

    class Config:
        env_file = ".env"

settings = Settings()

# ❌ 错误
DATABASE_URL = "sqlite:///app.db"  # 硬编码
API_KEY = "secret-key"  # 硬编码
```

## 3. Frontend (Next.js)

### 框架
- **Next.js 16 App Router**
- **React 19**
- **Tailwind CSS 4**

### 样式
- **禁止内联样式**（PDF 动态定位除外）
- 使用 Tailwind CSS 类名

```typescript
// ✅ 正确
<div className="flex items-center gap-4 p-6">
  <h1 className="text-2xl font-bold">Title</h1>
</div>

// ❌ 错误
<div style={{ display: 'flex', gap: '16px', padding: '24px' }}>
  <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Title</h1>
</div>
```

### 状态管理
- 复杂状态使用 **Zustand**
- 避免 Prop Drilling
- 简单状态使用 `useState`

```typescript
// ✅ 正确：使用 Zustand
import { create } from 'zustand'

const useBookStore = create((set) => ({
  books: [],
  addBook: (book) => set((state) => ({ books: [...state.books, book] }))
}))

// ❌ 错误：Prop Drilling
<Parent books={books} onAddBook={onAddBook}>
  <Child books={books} onAddBook={onAddBook}>
    <GrandChild books={books} onAddBook={onAddBook} />
  </Child>
</Parent>
```

### API 调用
- 所有请求通过 `/api/` 代理转发
- **禁止硬编码后端端口**
- 发送到后端的 JSON 字段**必须使用 snake_case**

```typescript
// ✅ 正确
const response = await fetch('/api/books', {
  method: 'POST',
  body: JSON.stringify({
    book_title: 'My Book',
    author_name: 'John Doe',
    page_count: 300
  })
})

// ❌ 错误
const response = await fetch('http://localhost:8000/books', {
  method: 'POST',
  body: JSON.stringify({
    bookTitle: 'My Book',
    authorName: 'John Doe',
    pageCount: 300
  })
})
```

### 日志
- **必须使用 `lib/logger.ts`**，禁止直接使用 `console.log`
- 开发环境：`NEXT_PUBLIC_LOG_LEVEL=debug` 或 `info`（默认）
- 生产环境：自动关闭或设置为 `warn`/`error`

```typescript
// ✅ 正确
import { logger } from '@/lib/logger'

logger.info('Book loaded', { bookId: 123 })
logger.error('Failed to load book', error)

// ❌ 错误
console.log('Book loaded')
console.error('Failed to load book', error)
```

## 4. 反模式 (THIS PROJECT)

| 反模式 | 问题 | 解决方案 |
|--------|------|--------|
| **Fat Routers** | 路由层包含业务逻辑 | 移至 Services 层 |
| **Direct SQL** | Router 中写 SQL 字符串 | 使用 ORM 方法 |
| **Sync IO** | 在 `async def` 中使用同步操作 | 使用 `aiofiles`/`run_in_threadpool` |
| **Root Clutter** | 根目录放置非配置文件 | 移至 `scripts/` 或 `backend/` |
| **Window Location** | 前端使用 `window.location` 跳转 | 使用 `useRouter` |
| **CamelCase API** | 前端发送 camelCase 参数 | 转换为 snake_case |
| **Console Logs** | 前端使用 `console.log` | 使用 `lib/logger.ts` |

## 5. Git 约定

### 提交信息格式
```
<type>: <subject>

<body>
```

**Type 类型**:
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 代码重构
- `test`: 添加或修改测试
- `chore`: 构建、依赖等

**示例**:
```
feat: 添加便携模式数据存储

- 实现 exe 同级 data 目录检测
- 支持数据随身携带
- 修复路径计算错误

Fixes #123
```

### 分支命名
- `feature/xxx` - 新功能
- `fix/xxx` - 修复
- `docs/xxx` - 文档
- `refactor/xxx` - 重构

## 6. 文件组织

### Backend
```
backend/
├── app/
│   ├── main.py              # 应用入口
│   ├── routers/             # API 路由
│   │   ├── books.py
│   │   ├── ai.py
│   │   └── ...
│   ├── services/            # 业务逻辑
│   │   ├── book_service.py
│   │   ├── dict_service.py
│   │   └── ...
│   ├── models/              # 数据模型
│   │   ├── database.py
│   │   ├── book.py
│   │   └── ...
│   ├── parsers/             # 文档解析
│   │   ├── pdf_parser.py
│   │   ├── epub_parser.py
│   │   └── ...
│   └── utils/               # 工具函数
│       ├── text_utils.py
│       └── ...
├── tests/                   # 单元测试
├── requirements.txt         # 依赖
└── data/                    # 数据目录（开发模式）
```

### Frontend
```
frontend/
├── src/
│   ├── app/                 # App Router 页面
│   │   ├── page.tsx         # 首页
│   │   ├── read/
│   │   │   └── [id]/
│   │   │       └── page.tsx # 阅读页面
│   │   └── ...
│   ├── components/          # UI 组件
│   │   ├── UniversalReader.tsx
│   │   ├── PDFReader.tsx
│   │   ├── EPUBReader.tsx
│   │   └── ...
│   ├── lib/                 # 工具库
│   │   ├── api.ts           # API 客户端
│   │   ├── logger.ts        # 日志工具
│   │   └── ...
│   ├── hooks/               # 自定义 Hooks
│   │   └── useBookStore.ts
│   └── styles/              # 全局样式
└── public/                  # 静态资源
```

## 7. 测试

### 后端测试
```bash
cd backend
pytest tests/test_vocabulary.py  # 单个文件
pytest tests/                    # 所有测试
pytest -v                        # 详细输出
```

### 前端测试
```bash
cd frontend
npm run test                     # 运行测试
npm run test:watch              # 监听模式
```

## 8. 性能指标

| 指标 | 目标 | 说明 |
|------|------|------|
| **启动速度** | < 5 秒 | 冷启动（含 Python 初始化） |
| **内存占用** | < 800 MB | 主进程 + 渲染进程 + Python 进程 |
| **API 响应** | < 200 ms | 平均响应时间 |
| **页面加载** | < 1 秒 | 首屏加载时间 |

更多问题见 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
