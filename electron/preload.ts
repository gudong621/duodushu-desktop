import { contextBridge, ipcRenderer } from 'electron';

// 预定义默认后端 URL（用于便携版）
const DEFAULT_BACKEND_URL = 'http://127.0.0.1:8000';

// 获取后端 URL（优先使用预定义的 URL，避免 IPC 问题）
let cachedBackendUrl = DEFAULT_BACKEND_URL;

// 初始化时尝试获取一次后端 URL（如果 Electron 主进程提供了）
ipcRenderer.invoke('get-backend-url').then((url: string) => {
  cachedBackendUrl = url;
  console.log('[Preload] Backend URL received:', url);
}).catch((err) => {
  console.error('[Preload] Failed to get backend URL:', err);
});

contextBridge.exposeInMainWorld('electronAPI', {
  // 获取后端 URL
  getBackendUrl: async () => {
    // 优先使用缓存的 URL
    if (cachedBackendUrl && cachedBackendUrl !== DEFAULT_BACKEND_URL) {
      return cachedBackendUrl;
    }
    // 如果 Electron 主进程提供了自定义 URL，使用它
    try {
      const url = await ipcRenderer.invoke('get-backend-url');
      if (url && url !== DEFAULT_BACKEND_URL) {
        cachedBackendUrl = url;
        console.log('[Preload] Updated backend URL:', url);
        return url;
      }
    } catch (err) {
      console.error('[Preload] Failed to get backend URL:', err);
    }
    // 回退到默认值
    return DEFAULT_BACKEND_URL;
  },

  // 示例：从渲染进程发送消息到主进程
  sendMessage: (message: string) => ipcRenderer.send('message', message),
  // 示例：打开外部链接
  openExternal: (url: string) => ipcRenderer.send('open-external', url),

  // 菜单导航事件监听
  onNavigate: (callback: (path: string) => void) => {
    ipcRenderer.on('navigate', (_event, path: string) => callback(path));
  },

  // 菜单操作事件监听
  onMenuAction: (callback: (action: string) => void) => {
    ipcRenderer.on('menu-action', (_event, action: string) => callback(action));
  },

  // 移除导航事件监听
  removeNavigateListener: () => {
    ipcRenderer.removeAllListeners('navigate');
  },

  // 移除菜单操作事件监听
  removeMenuActionListener: () => {
    ipcRenderer.removeAllListeners('menu-action');
  },
});
