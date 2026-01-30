# 故障排查

**最后更新**: 2026-01-30

本文档列出常见问题和解决方案。

## 1. 后端问题

### 后端无法启动

**症状**: 运行 `npm run dev` 时后端进程立即退出

**可能原因**:
1. Python 版本不符合要求
2. 依赖未安装完整
3. 端口被占用
4. 数据目录权限问题

**解决方案**:
```bash
# 1. 检查 Python 版本
python --version  # 应该是 3.10+

# 2. 重新安装依赖
cd backend
pip install -r requirements.txt --force-reinstall

# 3. 检查端口是否被占用
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # macOS/Linux

# 4. 检查数据目录权限
ls -la backend/data/
chmod 755 backend/data/
```

### 后端连接数据库失败

**症状**: 日志显示 `cannot connect to database`

**可能原因**:
1. 数据库文件损坏
2. 数据目录不存在
3. 权限问题

**解决方案**:
```bash
# 1. 删除损坏的数据库
rm backend/data/app.db

# 2. 重新启动应用，会自动创建新数据库
npm run dev

# 3. 如果仍然失败，检查数据目录
mkdir -p backend/data
chmod 755 backend/data
```

### 后端 API 返回 500 错误

**症状**: API 请求返回 500 Internal Server Error

**可能原因**:
1. 业务逻辑错误
2. 数据库查询失败
3. 文件操作失败

**解决方案**:
```bash
# 1. 查看后端日志
# 在终端中查看详细错误信息

# 2. 启用调试模式
cd backend
python -m uvicorn app.main:app --reload --log-level debug

# 3. 使用 Python 调试器
# 在代码中添加断点
import pdb; pdb.set_trace()
```

### 后端内存占用过高

**症状**: 应用运行一段时间后内存占用不断增加

**可能原因**:
1. 内存泄漏
2. 缓存未清理
3. 文件句柄未关闭

**解决方案**:
```bash
# 1. 监控内存使用
# Windows
tasklist /FI "IMAGENAME eq python.exe"

# macOS/Linux
ps aux | grep python

# 2. 重启应用
# 这是临时解决方案，需要找到根本原因

# 3. 检查代码中的资源泄漏
# 确保所有文件都正确关闭
with open(file) as f:
    data = f.read()
```

## 2. 前端问题

### 前端无法连接后端

**症状**: 浏览器控制台显示 `Failed to fetch` 或 `CORS error`

**可能原因**:
1. 后端未启动
2. API 基础 URL 配置错误
3. CORS 配置问题

**解决方案**:
```bash
# 1. 确保后端已启动
# 在另一个终端运行
cd backend
python -m uvicorn app.main:app --reload

# 2. 检查 API 基础 URL
# 查看 frontend/src/lib/api.ts
# 应该是 http://localhost:8000 或 /api

# 3. 检查后端 CORS 配置
# 查看 backend/app/main.py
# 确保允许前端的 origin
```

### 前端页面加载缓慢

**症状**: 页面加载需要很长时间

**可能原因**:
1. 网络连接慢
2. 后端响应慢
3. 前端代码性能问题

**解决方案**:
```bash
# 1. 检查网络连接
# 打开浏览器 DevTools (F12)
# 查看 Network 标签，检查请求时间

# 2. 检查后端性能
# 查看后端日志，看是否有慢查询

# 3. 优化前端代码
# 使用 React DevTools 检查组件渲染
# 查看是否有不必要的重新渲染
```

### 前端样式错乱

**症状**: 页面布局混乱，样式不正确

**可能原因**:
1. Tailwind CSS 未正确编译
2. CSS 冲突
3. 浏览器缓存

**解决方案**:
```bash
# 1. 清除浏览器缓存
# Ctrl+Shift+Delete (Windows)
# Cmd+Shift+Delete (macOS)

# 2. 重新构建前端
cd frontend
npm run build

# 3. 检查 Tailwind 配置
# 查看 frontend/tailwind.config.js
# 确保所有必要的路径都包含在内
```

### 前端控制台错误

**症状**: 浏览器控制台显示 JavaScript 错误

**可能原因**:
1. 代码错误
2. 依赖版本不兼容
3. 环境变量未设置

**解决方案**:
```bash
# 1. 查看完整错误信息
# 打开浏览器 DevTools (F12)
# 查看 Console 标签

# 2. 检查环境变量
# 查看 frontend/.env.local
# 确保所有必要的变量都已设置

# 3. 重新安装依赖
cd frontend
rm -rf node_modules
npm install
npm run dev
```

## 3. Electron 问题

### Electron 窗口无法打开

**症状**: 运行 `npm run dev` 时 Electron 窗口不出现

**可能原因**:
1. Node.js 版本不符合要求
2. 依赖未安装完整
3. 显示服务器问题（Linux）

**解决方案**:
```bash
# 1. 检查 Node.js 版本
node --version  # 应该是 v18+

# 2. 重新安装依赖
rm -rf node_modules
npm install

# 3. 清除 Electron 缓存
rm -rf ~/.electron

# 4. 重新启动
npm run dev
```

### Electron 应用崩溃

**症状**: 应用启动后立即崩溃

**可能原因**:
1. 主进程错误
2. 渲染进程错误
3. 原生模块问题

**解决方案**:
```bash
# 1. 查看崩溃日志
# Windows: %APPDATA%\duodushu-desktop\logs\
# macOS: ~/Library/Logs/duodushu-desktop/
# Linux: ~/.config/duodushu-desktop/logs/

# 2. 启用调试模式
npm run electron:dev

# 3. 查看 Electron 开发者工具
# 按 F12 打开开发者工具
```

### 便携模式无法工作

**症状**: 应用在便携模式下无法启动或数据丢失

**可能原因**:
1. `data` 目录不存在
2. 路径计算错误
3. 权限问题

**解决方案**:
```bash
# 1. 创建 data 目录
mkdir Duodushu/data

# 2. 检查路径
# 查看 electron/main.ts
# 确保路径计算正确

# 3. 检查权限
# 确保 data 目录可读写
chmod 755 Duodushu/data
```

## 4. 数据问题

### 数据丢失

**症状**: 应用重启后书籍或笔记消失

**可能原因**:
1. 后端未启动
2. 数据目录指向错误位置
3. 数据库损坏

**解决方案**:
```bash
# 1. 检查后端是否运行
# 查看进程列表
ps aux | grep python

# 2. 检查数据目录
# 开发模式：backend/data/
# 便携模式：Duodushu/data/
# 标准模式：C:\Users\<username>\AppData\Roaming\duodushu-desktop\

# 3. 检查数据库
sqlite3 backend/data/app.db
.tables
SELECT COUNT(*) FROM books;

# 4. 从备份恢复
# 如果有备份，复制回来
cp backup/app.db backend/data/
```

### 数据库损坏

**症状**: 应用显示数据库错误

**可能原因**:
1. 异常关闭
2. 磁盘空间不足
3. 文件系统错误

**解决方案**:
```bash
# 1. 检查数据库完整性
sqlite3 backend/data/app.db "PRAGMA integrity_check;"

# 2. 修复数据库
sqlite3 backend/data/app.db ".recover" | sqlite3 recovered.db

# 3. 删除损坏的数据库
rm backend/data/app.db
# 应用会自动创建新数据库

# 4. 从备份恢复
cp backup/app.db backend/data/
```

## 5. 性能问题

### 应用启动缓慢

**症状**: 应用启动需要很长时间

**可能原因**:
1. 后端初始化慢
2. 前端加载慢
3. 磁盘 I/O 慢

**解决方案**:
```bash
# 1. 测量启动时间
time npm run dev

# 2. 检查后端初始化
# 查看后端日志，看哪个步骤耗时最长

# 3. 优化前端加载
# 使用 Code Splitting
# 使用 Dynamic Imports
```

### 应用运行卡顿

**症状**: 应用响应缓慢，操作延迟

**可能原因**:
1. CPU 占用过高
2. 内存不足
3. 磁盘 I/O 瓶颈

**解决方案**:
```bash
# 1. 监控资源使用
# Windows: 任务管理器
# macOS: 活动监视器
# Linux: top 或 htop

# 2. 检查是否有后台任务
# 查看后端日志

# 3. 优化代码
# 使用 Profiler 找到瓶颈
```

## 6. 网络问题

### 无法连接 AI API

**症状**: AI 功能无法使用，显示网络错误

**可能原因**:
1. 网络连接问题
2. API Key 无效
3. API 服务不可用

**解决方案**:
```bash
# 1. 检查网络连接
ping 8.8.8.8

# 2. 检查 API Key
# 查看应用设置，确保 API Key 正确

# 3. 检查 API 服务状态
# 访问 API 提供商的状态页面

# 4. 检查防火墙
# 确保防火墙允许应用访问网络
```

### 离线模式无法工作

**症状**: 断网后应用无法使用

**可能原因**:
1. 应用依赖网络连接
2. 离线功能未实现
3. 缓存不完整

**解决方案**:
```bash
# 1. 检查应用设计
# 应用应该支持离线阅读和本地词典查询

# 2. 预加载数据
# 确保词典数据已下载

# 3. 检查网络状态检测
# 应用应该检测网络状态并相应调整功能
```

## 7. 获取帮助

如果以上解决方案都不能解决问题，请：

1. **查看日志文件**
   - 后端日志：`logs/backend_debug.txt`
   - 前端日志：浏览器 DevTools Console
   - Electron 日志：`~/.config/duodushu-desktop/logs/`

2. **收集诊断信息**
   - 操作系统版本
   - Node.js 版本
   - Python 版本
   - 完整的错误信息和日志

3. **提交 Issue**
   - 在 GitHub 上提交 Issue
   - 包含诊断信息和重现步骤

4. **联系开发者**
   - 通过项目主页联系开发者
