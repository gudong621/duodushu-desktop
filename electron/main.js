"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var fs = require("fs");
var child_process_1 = require("child_process");
var util = require("util");
var url = require("url");
// Logging setup
var logFile = path.join(electron_1.app.getPath('userData'), 'startup.log');
var errorLogFile = path.join(electron_1.app.getPath('userData'), 'startup_error.log');
function logToFile(message) {
    var timestamp = new Date().toISOString();
    var logMessage = "[".concat(timestamp, "] ").concat(message, "\n");
    try {
        fs.appendFileSync(logFile, logMessage);
    }
    catch (error) {
        console.error('Failed to write to log file:', error);
    }
}
function logErrorToFile(message, error) {
    var timestamp = new Date().toISOString();
    var logMessage = "[".concat(timestamp, "] [ERROR] ").concat(message, "\n");
    if (error) {
        logMessage += "Stack: ".concat(util.inspect(error), "\n");
    }
    try {
        fs.appendFileSync(errorLogFile, logMessage);
        fs.appendFileSync(logFile, logMessage);
    }
    catch (e) {
        console.error('Failed to write to error log file:', e);
    }
}
// Clear logs on startup
try {
    fs.writeFileSync(logFile, '');
    fs.writeFileSync(errorLogFile, '');
}
catch (e) { /* ignore */ }
logToFile("App starting...");
logToFile("Node version: ".concat(process.versions.node));
logToFile("Electron version: ".concat(process.versions.electron));
logToFile("Chrome version: ".concat(process.versions.chrome));
logToFile("App Path: ".concat(electron_1.app.getAppPath()));
logToFile("UserData Path: ".concat(electron_1.app.getPath('userData')));
var mainWindow = null;
var pythonProcess = null;
// 定义常量
// 定义常量
// 使用 app.isPackaged 判定是否为生产环境（更可靠）
var IS_DEV = !electron_1.app.isPackaged;
var PY_DIST_FOLDER = 'backend'; // 打包后 Python 可执行文件所在目录名称
// const PY_MODULE = 'backend'; // Python 模块/可执行文件名
logToFile("IS_DEV: ".concat(IS_DEV, " (app.isPackaged: ").concat(electron_1.app.isPackaged, ")"));
// 禁用 GPU 以避免崩溃问题
electron_1.app.commandLine.appendSwitch('--disable-gpu');
electron_1.app.commandLine.appendSwitch('--disable-software-rasterizer');
electron_1.app.commandLine.appendSwitch('--no-sandbox');
// Register the scheme as privileged (must be done before app is ready)
if (!IS_DEV) {
    electron_1.protocol.registerSchemesAsPrivileged([
        { scheme: 'app', privileges: { secure: true, standard: true, supportFetchAPI: true, corsEnabled: true } }
    ]);
}
function createWindow() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logToFile('createWindow called');
                    mainWindow = new electron_1.BrowserWindow({
                        width: 1280,
                        height: 800,
                        webPreferences: {
                            preload: path.join(__dirname, 'preload.js'),
                            nodeIntegration: false,
                            contextIsolation: true,
                            webSecurity: false, // Disable web security to allow mixed content (HTTP requests to localhost)
                            allowRunningInsecureContent: true,
                        },
                    });
                    if (!IS_DEV) return [3 /*break*/, 1];
                    // 开发模式：加载 Next.js 开发服务器
                    logToFile('Loading development URL: http://localhost:3000');
                    mainWindow.loadURL('http://localhost:3000');
                    mainWindow.webContents.openDevTools();
                    return [3 /*break*/, 3];
                case 1:
                    // 生产模式：使用自定义协议加载静态文件
                    // Setup app:// protocol handler
                    electron_1.protocol.handle('app', function (request) {
                        var reqUrl = request.url;
                        logToFile("Requesting: ".concat(reqUrl));
                        var pathName = new URL(reqUrl).pathname;
                        if (pathName === '/') {
                            pathName = '/index.html';
                        }
                        // Handle Next.js directory indices (like /vocabulary -> /vocabulary.html or /vocabulary/index.html)
                        // But since Next.js 'export' usually generates .html files for pages, we check that.
                        var possiblePaths = [
                            path.join(__dirname, '../frontend/out', pathName),
                            path.join(__dirname, '../frontend/out', pathName + '.html'),
                            path.join(__dirname, '../frontend/out', pathName, 'index.html')
                        ];
                        var filePath = '';
                        for (var _i = 0, possiblePaths_1 = possiblePaths; _i < possiblePaths_1.length; _i++) {
                            var p = possiblePaths_1[_i];
                            // Decoding URI component to handle spaces/special chars if any
                            var decodedPath = decodeURIComponent(p);
                            if (fs.existsSync(decodedPath) && fs.statSync(decodedPath).isFile()) {
                                filePath = decodedPath;
                                break;
                            }
                        }
                        if (!filePath) {
                            // 404 fallback
                            filePath = path.join(__dirname, '../frontend/out', '404.html');
                            if (!fs.existsSync(filePath)) {
                                // Final fallback if 404 doesn't exist
                                filePath = path.join(__dirname, '../frontend/out', 'index.html');
                            }
                        }
                        return electron_1.net.fetch(url.pathToFileURL(filePath).toString());
                    });
                    logToFile('Loading URL: app://./index.html');
                    return [4 /*yield*/, mainWindow.loadURL('app://./index.html')];
                case 2:
                    _a.sent();
                    logToFile('URL loaded successfully');
                    _a.label = 3;
                case 3:
                    // 处理外部链接打开请求
                    electron_1.ipcMain.on('open-external', function (event, url) {
                        electron_1.shell.openExternal(url);
                    });
                    // 获取后端 URL（用于前端动态检测）
                    electron_1.ipcMain.handle('get-backend-url', function (event) {
                        var port = 8000;
                        var backendUrl = "http://127.0.0.1:".concat(port);
                        logToFile("Providing backend URL: ".concat(backendUrl));
                        return backendUrl;
                    });
                    mainWindow.webContents.on('did-fail-load', function (event, errorCode, errorDescription) {
                        logErrorToFile("Page failed to load: ".concat(errorCode, " - ").concat(errorDescription));
                    });
                    mainWindow.webContents.on('dom-ready', function () {
                        logToFile('DOM Ready');
                    });
                    return [2 /*return*/];
            }
        });
    });
}
// 启动 Python 后端
function startPythonBackend() {
    logToFile('startPythonBackend called');
    var scriptPath;
    var cmd;
    var args = [];
    var appPath = electron_1.app.getAppPath();
    // 确定数据目录路径 (便携模式优先)
    // 检查应用同级目录下是否有 data 文件夹
    // 在开发模式下，我们使用项目根目录下的 data
    // 在生产模式(打包后)，如果exe旁边有data，则用那个，否则用 userData
    var dataPath;
    if (IS_DEV) {
        // 开发环境：使用 app.getAppPath() 而不是 process.cwd()
        // app.getAppPath() 返回应用目录（项目根目录），更可靠
        var appPath_1 = electron_1.app.getAppPath();
        dataPath = path.join(appPath_1, 'backend', 'data');
        logToFile("\u5F00\u53D1\u6A21\u5F0F - \u4F7F\u7528\u5E94\u7528\u76EE\u5F55: ".concat(appPath_1));
    }
    else {
        // 生产环境检查逻辑：便携模式优先
        // 1. 检查是否为 electron-builder 的便携式应用 (Portable App)
        // 此时 process.env.PORTABLE_EXECUTABLE_DIR 会指向真实 exe 所在目录
        var portableExeDir = process.env.PORTABLE_EXECUTABLE_DIR;
        // 2. 如果不是便携版，则使用 process.execPath (解压版/安装版)
        var exeDir = portableExeDir ? portableExeDir : path.dirname(process.execPath);
        var portableDataPath = path.join(exeDir, 'data');
        logToFile("Portable check - Executable Dir: ".concat(exeDir, " (Portable Env: ").concat(portableExeDir || 'N/A', ")"));
        // 策略：
        // A. 如果是便携版(PORTABLE_EXECUTABLE_DIR 存在)，强制使用该目录下的 data (自动创建)
        // B. 如果是普通版，只有当 exe 同级存在 data 目录时才启用便携模式 (USB 模式)
        if (portableExeDir) {
            // 便携版强制使用同级 data
            dataPath = portableDataPath;
            if (!fs.existsSync(dataPath)) {
                try {
                    fs.mkdirSync(dataPath);
                }
                catch (e) {
                    logErrorToFile('Failed to create portable data dir', e);
                }
            }
            logToFile("\u68C0\u6D4B\u5230\u4FBF\u643A\u7248\u8FD0\u884C\u73AF\u5883\uFF0C\u5F3A\u5236\u4F7F\u7528\u6570\u636E\u76EE\u5F55: ".concat(dataPath));
        }
        else if (fs.existsSync(portableDataPath)) {
            // 解压版/安装版：如果发现同级有 data 目录，则使用它 (USB 模式)
            dataPath = portableDataPath;
            logToFile("\u68C0\u6D4B\u5230\u540C\u7EA7 data \u76EE\u5F55\uFF0C\u542F\u7528\u4FBF\u643A\u6A21\u5F0F: ".concat(dataPath));
        }
        else {
            // 默认回退到系统 userData
            dataPath = electron_1.app.getPath('userData');
            logToFile("\u4F7F\u7528\u6807\u51C6\u5B89\u88C5\u6A21\u5F0F (userData): ".concat(dataPath));
        }
    }
    logToFile("Python Data Path: ".concat(dataPath));
    if (IS_DEV) {
        // 开发模式：直接运行 Python 脚本
        // 假设此时我们在项目根目录运行 electron
        cmd = 'python'; // 或 'python3', 取决于系统环境
        scriptPath = path.join(process.cwd(), 'backend', 'run_backend.py'); // 我们需要创建一个 run_backend.py
        args = [scriptPath, '--port', '8000', '--data-dir', dataPath];
    }
    else {
        // 生产模式：运行打包后的可执行文件
        var backendPath = path.join(process.resourcesPath, PY_DIST_FOLDER);
        var exeName = process.platform === 'win32' ? 'backend.exe' : 'backend';
        var exePath = path.join(backendPath, exeName);
        // 确定工作目录：backend.exe 所在的实际目录
        // PyInstaller 将可执行文件放在 _internal/ 子目录中
        // 设置工作目录为 _internal 目录，确保数据目录正确创建
        var workingDir = path.dirname(exePath);
        var internalDir = path.join(backendPath, '_internal');
        if (fs.existsSync(internalDir)) {
            workingDir = internalDir;
        }
        // 传递绝对路径作为 --data-dir 参数
        scriptPath = exePath;
        cmd = scriptPath;
        // 将 dataPath 转换为绝对路径（相对于 exe 所在目录）
        var absoluteDataPath = path.resolve(workingDir, dataPath);
        args = ['--port', '8000', '--data-dir', absoluteDataPath];
        logToFile("Starting Python backend in directory: ".concat(workingDir));
        logToFile("Script: ".concat(scriptPath));
        logToFile("Args: ".concat(args.join(' ')));
    }
    logToFile("Starting Python backend: ".concat(cmd, " ").concat(args.join(' ')));
    try {
        pythonProcess = (0, child_process_1.spawn)(cmd, args);
        logToFile("Python process spawned with PID: ".concat(pythonProcess.pid));
        if (pythonProcess.stdout) {
            pythonProcess.stdout.on('data', function (data) {
                // Log only critical info or errors to avoid flooding
                //   console.log(`[Python]: ${data}`);
            });
        }
        if (pythonProcess.stderr) {
            pythonProcess.stderr.on('data', function (data) {
                logErrorToFile("[Python Stderr]: ".concat(data));
            });
        }
        pythonProcess.on('error', function (err) {
            logErrorToFile('Python process spawn error', err);
        });
        pythonProcess.on('close', function (code) {
            logToFile("Python process exited with code ".concat(code));
        });
    }
    catch (e) {
        logErrorToFile('Failed to spawn python process', e);
    }
}
function stopPythonBackend() {
    if (pythonProcess) {
        logToFile('Stopping Python backend...');
        pythonProcess.kill();
        pythonProcess = null;
    }
}
// 获取后端 URL（用于前端动态检测）- 必须在 app.whenReady() 之前注册
electron_1.ipcMain.handle('get-backend-url', function (event) {
    var port = 8000;
    var backendUrl = "http://127.0.0.1:".concat(port);
    logToFile("Providing backend URL: ".concat(backendUrl));
    return backendUrl;
});
// 处理外部链接打开请求
electron_1.ipcMain.on('open-external', function (event, url) {
    electron_1.shell.openExternal(url);
});
// 获取后端 URL（用于前端动态检测）- 必须在 app.whenReady() 之前注册
electron_1.ipcMain.on('get-backend-url', function (event) {
    var port = 8000;
    var backendUrl = "http://127.0.0.1:".concat(port);
    logToFile("Providing backend URL: ".concat(backendUrl));
    return backendUrl;
});
electron_1.app.whenReady().then(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logToFile('App ready event received');
                // 先启动后端，再创建窗口
                // 实际项目中可能需要等待后端健康检查(health check)通过后再加载前端
                // 这里暂时直接启动
                startPythonBackend();
                return [4 /*yield*/, createWindow()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
electron_1.app.on('activate', function () {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(electron_1.BrowserWindow.getAllWindows().length === 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, createWindow()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
});
;
electron_1.app.on('window-all-closed', function () {
    logToFile('window-all-closed event');
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('will-quit', function () {
    logToFile('will-quit event');
    stopPythonBackend();
});
