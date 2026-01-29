import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // 示例：从渲染进程发送消息到主进程
  sendMessage: (message: string) => ipcRenderer.send('message', message),
  // 示例：打开外部链接
  openExternal: (url: string) => ipcRenderer.send('open-external', url)
});
