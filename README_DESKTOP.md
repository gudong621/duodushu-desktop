# 多读书桌面版 (Duodushu Desktop) 构建指南

本项目基于 Electron + Next.js + Python (FastAPI) 架构，支持生成便携版 (Portable) 和安装版。

## 1. 环境准备

### Node.js
确保安装了 Node.js (推荐 v18+)。
在根目录安装依赖：
```bash
npm install
```
(前端依赖会自动在 `npm run build:frontend` 时安装，或者你可以手动进入 `frontend` 目录运行 `npm install`)

### Python
确保安装了 Python 3.10+。
建议创建虚拟环境并安装依赖：
```bash
cd backend
# 创建虚拟环境 (可选)
python -m venv venv
# Windows 激活
.\venv\Scripts\activate
# macOS/Linux 激活
# source venv/bin/activate

# 安装依赖 (包含 PyInstaller)
pip install -r requirements.txt
```

## 2. 开发模式

同时启动前端、后端和 Electron 窗口进行调试：
```bash
# 在根目录运行
npm run dev
```

*注意：开发模式下数据存储在 `backend/data` 目录。*

## 3. 打包构建

构建最终的可执行文件：
```bash
# 在根目录运行
npm run build
```

该命令会自动执行以下步骤：
1.  构建 Next.js 前端 (生成 `frontend/out`)
2.  打包 Python 后端 (生成 `backend/dist/backend`)
3.  打包 Electron 应用 (生成 `dist_app/`)

### 构建产物
构建完成后，在 `dist_app` 目录下可以找到安装包或免安装压缩包。

*   **Windows**: `dist_app/Duodushu Setup 1.0.0.exe` 或 `win-unpacked/` 文件夹。

## 4. 便携模式 (Portable Mode) 说明

为了实现“数据随身带”，桌面版支持**便携模式**。

### 如何制作便携版？
1.  将构建生成的 `win-unpacked` 文件夹（或解压后的程序目录）重命名为 `Duodushu`。
2.  在 `Duodushu` 文件夹内（与 `Duodushu.exe` 同级），新建一个名为 `data` 的文件夹。
3.  现在的目录结构应该如下：
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
4.  现在，你可以将整个 `Duodushu` 文件夹拷贝到 U 盘或任何电脑上运行，所有数据都会存储在那个 `data` 文件夹里，不会写到系统 C 盘。

### 数据迁移
如果你在 Web 版或其他电脑上有数据：
1.  将原有的 `app.db` 复制到 `data/app.db`。
2.  将原有的 `uploads/` 内容复制到 `data/uploads/`。
3.  将原有的词典数据库复制到 `data/dicts/`。
