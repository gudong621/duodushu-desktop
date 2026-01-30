# 部署和打包指南

**最后更新**: 2026-01-30

本文档指导如何构建、打包和部署应用。

## 1. 构建流程

### 完整构建
在根目录运行以下命令：

```bash
npm run build
```

该命令会自动执行以下步骤：
1. 构建 Next.js 前端 (生成 `frontend/out`)
2. 打包 Python 后端 (生成 `backend/dist/backend`)
3. 打包 Electron 应用 (生成 `dist_app/`)

### 构建产物

构建完成后，在 `dist_app` 目录下可以找到：

**Windows**:
- `Duodushu Setup 1.0.0.exe` - 安装程序
- `win-unpacked/` - 解包后的应用目录

## 2. 便携模式 (Portable Mode)

### 什么是便携模式？

便携模式允许应用在没有安装的情况下直接运行，所有数据存储在应用目录下，支持"数据随身带"。

### 如何制作便携版？

#### 方法 1: 使用构建产物

1. 将构建生成的 `win-unpacked` 文件夹重命名为 `Duodushu`
2. 在 `Duodushu` 文件夹内（与 `Duodushu.exe` 同级），新建一个名为 `data` 的文件夹
3. 现在的目录结构应该如下：
   ```
   Duodushu/
   ├── Duodushu.exe
   ├── resources/
   ├── ...
   └── data/          <-- 用户数据目录
       ├── app.db     (自动生成)
       ├── uploads/   (自动生成)
       └── dicts/     (自动生成)
   ```
4. 现在，你可以将整个 `Duodushu` 文件夹拷贝到 U 盘或任何电脑上运行

#### 方法 2: 使用便携版 EXE

如果已经生成了 `DuoDuShu-Desktop-Portable.exe`，直接运行即可。应用会自动在 exe 同级创建 `data` 目录。

### 便携模式的工作原理

应用启动时会检查以下路径（按优先级）：

1. **exe 同级的 `data` 目录** - 便携模式
2. **系统 AppData 目录** - 标准安装模式

如果找到 exe 同级的 `data` 目录，应用会将所有数据存储在那里，否则使用系统标准路径。

## 3. 数据迁移

### 从 Web 版迁移数据

如果你在 Web 版或其他电脑上有数据：

1. 将原有的 `app.db` 复制到 `data/app.db`
2. 将原有的 `uploads/` 内容复制到 `data/uploads/`
3. 将原有的词典数据库复制到 `data/dicts/`

### 跨电脑迁移

便携模式的最大优势是数据迁移非常简单：

1. 在电脑 A 上使用应用，所有数据存储在 `Duodushu/data/` 目录
2. 将整个 `Duodushu` 文件夹复制到 U 盘
3. 在电脑 B 上运行 U 盘中的 `Duodushu.exe`
4. 所有数据、书籍、笔记都会自动恢复

## 4. 目录结构

### 开发模式
```
D:\build\duodushu-desktop\
├── backend/
│   ├── data/              <-- 开发数据存储位置
│   │   ├── app.db
│   │   ├── uploads/
│   │   └── dicts/
│   └── ...
├── frontend/
└── ...
```

### 便携模式
```
Duodushu/                  <-- 应用根目录
├── Duodushu.exe
├── resources/
├── data/                  <-- 便携数据存储位置
│   ├── app.db
│   ├── uploads/
│   └── dicts/
└── ...
```

### 标准安装模式
```
C:\Users\<username>\AppData\Roaming\duodushu-desktop\
├── app.db
├── uploads/
└── dicts/
```

## 5. 发布检查清单

在发布新版本前，请检查以下项目：

- [ ] 所有测试通过
- [ ] 代码已审查
- [ ] 版本号已更新 (`package.json`)
- [ ] 更新日志已编写
- [ ] 便携版已测试
- [ ] 安装版已测试
- [ ] 数据迁移已测试

## 6. 常见问题

**Q: 便携模式下数据存储在哪里？**
- 在 exe 同级的 `data` 目录下

**Q: 如何切换回标准安装模式？**
- 删除 exe 同级的 `data` 目录，应用会自动使用系统 AppData 目录

**Q: 便携版可以在 U 盘上运行吗？**
- 可以，这是便携版的主要用途

**Q: 如何备份数据？**
- 便携模式：复制整个 `Duodushu` 文件夹
- 标准模式：复制 `C:\Users\<username>\AppData\Roaming\duodushu-desktop\` 目录

更多问题见 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
