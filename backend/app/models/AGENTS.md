# AGENTS: backend/app/models

## OVERVIEW
SQLAlchemy 2.0 数据模型层，负责异步 ORM 实体定义、数据库连接配置及与 Pydantic 2.0 的验证映射。

## WHERE TO LOOK
| 模型 / 组件 | 关键文件 | 核心职责 |
|-------------|----------|----------|
| **Book** | `models.py` | 存储书籍元数据（标题、作者）、封面路径及异步解析进度状态。 |
| **Vocabulary** | `models.py` | 管理生词本，包含词义、记忆等级（Mastery）及下次复习时间。 |
| **DictionaryEntry**| `models.py` | 核心词典条目模型，映射 ECDICT 或 MDX 的静态查询数据。 |
| **CacheDictionary**| `models.py` | 缓存 AI 生成的词义解析结果（JSON），显著降低 LLM 调用成本。 |
| **Page / Chunk** | `models.py` / `page_chunk.py` | 存储书籍内容分片，为 FTS5 全文检索提供底层支撑。 |
| **DB Engine** | `database.py` | `aiosqlite` 异步引擎初始化与 `AsyncSession` 工厂配置。 |

## CONVENTIONS
- **异步 ORM**: 必须使用 `sqlalchemy.ext.asyncio` 进行非阻塞查询，执行时需显式调用 `await session.execute()`。
- **验证解耦**: 数据库模型仅负责持久化，API 层输入输出校验必须通过 **Pydantic 2.0** (开启 `from_attributes=True`)。
- **命名规范**: 数据库表名统一使用复数形式（如 `books`），列名统一使用 `snake_case`。
- **时区一致性**: `DateTime` 字段必须显式指定 `timezone=True`，并统一在应用层使用 UTC 时间处理。
- **延迟加载**: 复杂关联关系必须显式声明加载策略（如 `selectinload`），防止异步环境下出现 `Greenlet` 报错。
- **基类集成**: 所有模型必须继承自 `database.py` 中定义的 `Base` (DeclarativeBase) 以确保能被 Alembic 自动发现。

## ANTI-PATTERNS
- **DO NOT** 在模型类内混入业务逻辑 -> 模型应保持为 Anemic Domain Model，逻辑由 `services/` 承载。
- **DO NOT** 使用同步驱动 -> 连接字符串必须以 `sqlite+aiosqlite://` 开头，严禁使用同步 `sqlite3`。
- **DO NOT** 提交 `*.db` 数据库文件 -> 数据库结构变更必须且仅通过 `alembic` 迁移脚本进行同步。
- **DO NOT** 跨模型硬编码路径字符串 -> 统一引用 `database.BASE_DIR` 进行相对路径计算。
- **DO NOT** 在循环内执行单次查询 -> 必须使用 `in_()` 或 `join` 进行批量处理，以最小化 IO 开销。
