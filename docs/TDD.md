# 多读书 (Duodushu) 桌面客户端 - 技术架构文档

**版本**: 1.0
**日期**: 2026-01-29
**基于**: Electron + Next.js + Python (Sidecar)

---

## 1. 架构概览

为了最大程度复用现有的 Web 版代码（Next.js 前端 + FastAPI 后端），桌面版采用 **"Sidecar"（边车）模式**。Electron 作为应用外壳，负责管理生命周期和原生窗口；Next.js 作为 UI 渲染层；Python FastAPI 作为后台服务运行在子进程中，处理核心业务逻辑和数据库操作。

### 1.1 架构图

```mermaid
graph TD
    User[用户] --> ElectronWindow[Electron 窗口 (Renderer)]
    
    subgraph "Electron 主进程 (Main Process)"
        Main[Main.ts (Node.js)]
        AppLifecycle[生命周期管理]
        NativeMenu[原生菜单/托盘]
        AutoUpdater[自动更新]
        PythonManager[Python 进程管理器]
    end
    
    subgraph "前端渲染层 (Renderer Process)"
        NextJS[Next.js App (React)]
        IPC_Client[IPC 通信模块]
    end
    
    subgraph "后端服务层 (Python Subprocess)"
        FastAPI[FastAPI Server]
        CoreServices[业务逻辑 (Book/Dict/AI)]
        SQLite[SQLite 数据库]
    end
    
    %% 通信流
    ElectronWindow -- 渲染 UI --> NextJS
    NextJS -- HTTP REST API --> FastAPI
    NextJS -- IPC (窗口控制/系统对话框) --> Main
    Main -- spawn/kill --> FastAPI
    FastAPI -- 读写 --> SQLite
    
    %% 文件系统
    FastAPI -- 读写 --> UserData[用户数据目录 (AppData)]
```

---

## 2. 关键技术选型

| 模块 | 技术栈 | 说明 |
| :--- | :--- | :--- |
| **应用框架** | Electron | 跨平台桌面容器 |
| **打包工具** | electron-builder | 生成 Portable (zip) 及安装包 |
| **前端框架** | Next.js (Static Export) | 静态导出模式，作为本地文件加载 |
| **便携逻辑** | 自适应路径检测 | 优先使用运行目录下的 data 文件夹 |

---

## 3. 核心模块设计

### 3.1 Python 后端集成方案

#### 3.1.1 打包策略
使用 `PyInstaller` 将现有的 `backend/` 目录打包为独立的可执行文件（或文件夹）。
- **入口文件**: `backend/app/main.py`
- **依赖处理**: 包含所有 pip 依赖。
- **Sidecar 模式**: 打包后的二进制文件存放在 Electron 的 `resources/bin` 目录下。

#### 3.1.2 进程管理 (Main Process)
Electron 主进程负责 Python 后端的生命周期：
1.  **启动**: 使用 `child_process.spawn` 启动。通过 CLI 参数 `--data-dir` 告诉 Python 后端数据存储路径。
2.  **保活**: 监听非预期退出并重启。
3.  **退出**: App 关闭时强制杀死子进程，防止“孤儿进程”残留。

### 3.3 数据存储与便携模式

#### 3.3.1 路径自适应逻辑
Electron 主进程在启动时执行以下逻辑：
```javascript
const appPath = app.getAppPath(); // 软件运行目录
const localDataPath = path.join(appPath, '..', 'data'); // 假设是解压后的同级 data 目录

let userDataPath;
if (fs.existsSync(localDataPath)) {
    // 如果软件同级有 data 文件夹，进入“便携模式”
    userDataPath = localDataPath;
} else {
    // 否则使用系统标准路径 (AppData)
    userDataPath = app.getPath('userData');
}
app.setPath('userData', userDataPath);
```

#### 3.3.2 数据库与文件位置
- **数据库**: `${userDataPath}/app.db`
- **上传资源**: `${userDataPath}/uploads/`
- **这种设计保证了只要把整个软件文件夹拷贝走，学习进度和书籍就能实现“无感迁移”。`

---

## 4. 构建与部署流程

### 4.1 目录结构调整（建议）

```
duodushu-desktop/  (新根目录)
├── package.json   (Electron 项目配置)
├── electron/      (Electron 主进程代码)
│   ├── main.ts
│   ├── preload.ts
│   └── python-manager.ts
├── src/           (指向原 frontend/src 的软链接或拷贝)
├── python/        (指向原 backend 的软链接或拷贝)
├── resources/     (图标、构建资源)
└── dist/          (构建产出)
```
*或者直接在现有项目中添加 `electron/` 目录并修改根 `package.json`。*

### 4.2 构建步骤 (CI/CD)

1.  **Backend Build**:
    - 安装 Python 依赖。
    - 运行 PyInstaller打包后端 -> 输出到 `build/backend-dist`。
2.  **Frontend Build**:
    - 运行 `next build` (输出到 `out/` 目录)。
3.  **Electron Build**:
    - `electron-builder` 配置中：
      - 将 `build/backend-dist` 包含到 `extraResources`。
      - 将 `out/` 目录作为 web 资源。
    - 打包生成安装文件。

---

## 5. 安全与隐私

### 5.1 API Key 安全
- **Web**: 环境变量或服务器配置。
- **Desktop**: 
  - 使用 Electron 的 `safeStorage` API (基于系统 KeyChain) 加密存储用户的 API Key。
  - Python 后端不持久化明文 Key，每次启动或请求时由前端通过 Auth Header 传递，或在内存中临时持有。

### 5.2 网络安全
- 配置 `Content-Security-Policy` (CSP)。
- 限制 WebView 跳转外部链接。
- Python 后端仅监听 `127.0.0.1`，严禁监听 `0.0.0.0`，防止局域网攻击。

---

## 6. 开发路线图

### Phase 1: 验证原型 (POC)
1. 创建 Electron 壳子。
2. 手动启动现有的 FastAPI 后端。
3. 让 Electron 加载 Next.js 开发服务器 (localhost:3000)。
4. 验证 HTTP 通信是否正常。

### Phase 2: 打包流水线
1. 配置 PyInstaller。
2. 配置 Next.js Export。
3. 配置 electron-builder。
4. 实现 Python 进程的自动启动与关闭。

### Phase 3: 功能适配
1. 修改数据库路径逻辑 (Python)。
2. 修改 API Base URL 逻辑 (Frontend)。
3. 实现系统菜单和快捷键。

### Phase 4: 发布
1. 代码签名 (Code Signing)。
2. 自动更新配置。
3. 正式发布 v1.0。

---
**文档结束**
