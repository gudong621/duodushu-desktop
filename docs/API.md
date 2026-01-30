# API 文档

**最后更新**: 2026-01-30

本文档列出所有后端 API 端点、请求/响应格式和使用示例。

## 1. 基础信息

**基础 URL**: `http://localhost:8000` (开发模式) 或 `/api` (生产模式)

**认证**: 暂无（后续支持 API Key）

**响应格式**: JSON

## 2. 书籍管理 API

### 获取书籍列表

```
GET /api/books
```

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| `skip` | int | 跳过的记录数（分页） |
| `limit` | int | 返回的最大记录数 |
| `search` | str | 搜索关键词 |

**响应示例**:
```json
{
  "total": 10,
  "items": [
    {
      "id": "book_001",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "file_path": "uploads/book_001/content.pdf",
      "cover_path": "uploads/covers/book_001.jpg",
      "file_type": "pdf",
      "file_size": 1024000,
      "created_at": "2026-01-30T10:00:00Z",
      "updated_at": "2026-01-30T10:00:00Z"
    }
  ]
}
```

### 获取单本书籍详情

```
GET /api/books/{book_id}
```

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| `book_id` | str | 书籍 ID |

**响应示例**:
```json
{
  "id": "book_001",
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "file_path": "uploads/book_001/content.pdf",
  "cover_path": "uploads/covers/book_001.jpg",
  "file_type": "pdf",
  "file_size": 1024000,
  "page_count": 180,
  "created_at": "2026-01-30T10:00:00Z",
  "updated_at": "2026-01-30T10:00:00Z"
}
```

### 上传书籍

```
POST /api/books/upload
```

**请求体**: multipart/form-data

| 字段 | 类型 | 说明 |
|------|------|------|
| `file` | file | 书籍文件 (PDF/EPUB) |
| `title` | str | 书籍标题 |
| `author` | str | 作者名称 |

**响应示例**:
```json
{
  "id": "book_001",
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "file_path": "uploads/book_001/content.pdf",
  "message": "Book uploaded successfully"
}
```

### 删除书籍

```
DELETE /api/books/{book_id}
```

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| `book_id` | str | 书籍 ID |

**响应示例**:
```json
{
  "message": "Book deleted successfully",
  "id": "book_001"
}
```

## 3. 阅读进度 API

### 获取阅读进度

```
GET /api/books/{book_id}/progress
```

**响应示例**:
```json
{
  "book_id": "book_001",
  "current_page": 45,
  "total_pages": 180,
  "progress_percentage": 25,
  "last_read_at": "2026-01-30T15:30:00Z"
}
```

### 更新阅读进度

```
POST /api/books/{book_id}/progress
```

**请求体**:
```json
{
  "current_page": 50,
  "current_position": 0.28
}
```

**响应示例**:
```json
{
  "book_id": "book_001",
  "current_page": 50,
  "total_pages": 180,
  "progress_percentage": 28,
  "updated_at": "2026-01-30T15:35:00Z"
}
```

## 4. 笔记 API

### 获取笔记列表

```
GET /api/books/{book_id}/notes
```

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| `skip` | int | 跳过的记录数 |
| `limit` | int | 返回的最大记录数 |

**响应示例**:
```json
{
  "total": 5,
  "items": [
    {
      "id": "note_001",
      "book_id": "book_001",
      "page": 45,
      "content": "This is an important passage",
      "highlight_color": "yellow",
      "created_at": "2026-01-30T10:00:00Z",
      "updated_at": "2026-01-30T10:00:00Z"
    }
  ]
}
```

### 创建笔记

```
POST /api/books/{book_id}/notes
```

**请求体**:
```json
{
  "page": 45,
  "content": "This is an important passage",
  "highlight_color": "yellow"
}
```

**响应示例**:
```json
{
  "id": "note_001",
  "book_id": "book_001",
  "page": 45,
  "content": "This is an important passage",
  "highlight_color": "yellow",
  "created_at": "2026-01-30T10:00:00Z"
}
```

### 删除笔记

```
DELETE /api/books/{book_id}/notes/{note_id}
```

**响应示例**:
```json
{
  "message": "Note deleted successfully",
  "id": "note_001"
}
```

## 5. 生词本 API

### 获取生词列表

```
GET /api/vocabulary
```

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| `skip` | int | 跳过的记录数 |
| `limit` | int | 返回的最大记录数 |
| `book_id` | str | 按书籍过滤（可选） |

**响应示例**:
```json
{
  "total": 100,
  "items": [
    {
      "id": "vocab_001",
      "word": "serendipity",
      "definition": "The occurrence of events by chance in a happy or beneficial way",
      "example": "It was pure serendipity that we met",
      "book_id": "book_001",
      "page": 45,
      "learned": false,
      "created_at": "2026-01-30T10:00:00Z"
    }
  ]
}
```

### 添加生词

```
POST /api/vocabulary
```

**请求体**:
```json
{
  "word": "serendipity",
  "definition": "The occurrence of events by chance in a happy or beneficial way",
  "example": "It was pure serendipity that we met",
  "book_id": "book_001",
  "page": 45
}
```

**响应示例**:
```json
{
  "id": "vocab_001",
  "word": "serendipity",
  "definition": "The occurrence of events by chance in a happy or beneficial way",
  "example": "It was pure serendipity that we met",
  "book_id": "book_001",
  "page": 45,
  "learned": false,
  "created_at": "2026-01-30T10:00:00Z"
}
```

### 标记生词为已学

```
PUT /api/vocabulary/{vocab_id}
```

**请求体**:
```json
{
  "learned": true
}
```

**响应示例**:
```json
{
  "id": "vocab_001",
  "word": "serendipity",
  "learned": true,
  "updated_at": "2026-01-30T10:05:00Z"
}
```

### 删除生词

```
DELETE /api/vocabulary/{vocab_id}
```

**响应示例**:
```json
{
  "message": "Vocabulary deleted successfully",
  "id": "vocab_001"
}
```

## 6. 词典 API

### 查询词典

```
GET /api/dictionary/lookup
```

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| `word` | str | 要查询的单词 |
| `dict_type` | str | 词典类型 (ecdict/mdx) |

**响应示例**:
```json
{
  "word": "serendipity",
  "phonetic": "/ˌserənˈdɪpɪti/",
  "definition": "The occurrence of events by chance in a happy or beneficial way",
  "examples": [
    "It was pure serendipity that we met"
  ],
  "synonyms": ["luck", "chance", "fortune"],
  "dict_type": "ecdict"
}
```

### 获取词典列表

```
GET /api/dictionary/list
```

**响应示例**:
```json
{
  "dictionaries": [
    {
      "id": "ecdict",
      "name": "ECDICT",
      "type": "ecdict",
      "word_count": 100000,
      "installed": true
    },
    {
      "id": "mdx_001",
      "name": "Oxford Dictionary",
      "type": "mdx",
      "word_count": 50000,
      "installed": false
    }
  ]
}
```

## 7. AI API

### 获取 AI 回复

```
POST /api/ai/chat
```

**请求体**:
```json
{
  "message": "What does 'serendipity' mean?",
  "context": {
    "book_id": "book_001",
    "page": 45,
    "selected_text": "serendipity"
  }
}
```

**响应示例**:
```json
{
  "reply": "Serendipity means the occurrence of events by chance in a happy or beneficial way. It's often used to describe a fortunate coincidence.",
  "sources": ["ECDICT", "Context from page 45"]
}
```

### 翻译文本

```
POST /api/ai/translate
```

**请求体**:
```json
{
  "text": "The Great Gatsby is a masterpiece of American literature",
  "target_language": "zh"
}
```

**响应示例**:
```json
{
  "original": "The Great Gatsby is a masterpiece of American literature",
  "translated": "《了不起的盖茨比》是美国文学的杰作",
  "target_language": "zh"
}
```

## 8. 设置 API

### 获取设置

```
GET /api/settings
```

**响应示例**:
```json
{
  "theme": "light",
  "font_size": 14,
  "line_height": 1.5,
  "api_key": "sk-***",
  "language": "en"
}
```

### 更新设置

```
PUT /api/settings
```

**请求体**:
```json
{
  "theme": "dark",
  "font_size": 16,
  "line_height": 1.8,
  "api_key": "sk-new-key"
}
```

**响应示例**:
```json
{
  "message": "Settings updated successfully",
  "settings": {
    "theme": "dark",
    "font_size": 16,
    "line_height": 1.8,
    "api_key": "sk-***",
    "language": "en"
  }
}
```

## 9. 错误响应

所有错误响应都遵循以下格式：

```json
{
  "detail": "Error message",
  "status_code": 400,
  "error_code": "INVALID_REQUEST"
}
```

**常见错误码**:

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 400 | INVALID_REQUEST | 请求参数无效 |
| 401 | UNAUTHORIZED | 未授权 |
| 404 | NOT_FOUND | 资源不存在 |
| 409 | CONFLICT | 资源冲突 |
| 500 | INTERNAL_ERROR | 服务器内部错误 |

## 10. 使用示例

### Python 示例

```python
import requests

# 获取书籍列表
response = requests.get('http://localhost:8000/api/books')
books = response.json()

# 上传书籍
with open('book.pdf', 'rb') as f:
    files = {'file': f}
    data = {'title': 'My Book', 'author': 'John Doe'}
    response = requests.post('http://localhost:8000/api/books/upload', files=files, data=data)
    book = response.json()

# 查询词典
response = requests.get('http://localhost:8000/api/dictionary/lookup', params={'word': 'serendipity'})
definition = response.json()
```

### JavaScript 示例

```javascript
// 获取书籍列表
const response = await fetch('/api/books');
const books = await response.json();

// 上传书籍
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('title', 'My Book');
formData.append('author', 'John Doe');

const uploadResponse = await fetch('/api/books/upload', {
  method: 'POST',
  body: formData
});
const book = await uploadResponse.json();

// 查询词典
const dictResponse = await fetch('/api/dictionary/lookup?word=serendipity');
const definition = await dictResponse.json();
```

## 11. 速率限制

暂无速率限制（后续可能添加）

## 12. 版本控制

当前 API 版本: **v1.0**

所有端点都在 `/api/` 路径下。

更多问题见 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
