'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 定义 electronAPI 类型
declare global {
  interface Window {
    electronAPI?: {
      getBackendUrl: () => Promise<string>;
      sendMessage: (message: string) => void;
      openExternal: (url: string) => void;
      onNavigate: (callback: (path: string) => void) => void;
      onMenuAction: (callback: (action: string) => void) => void;
      removeNavigateListener: () => void;
      removeMenuActionListener: () => void;
    };
  }
}

interface MenuHandlerProps {
  onImportBook?: () => void;
  onExportNotes?: () => void;
  onOpenSettings?: () => void;
  onShowAbout?: () => void;
  onCheckUpdate?: () => void;
}

/**
 * 菜单事件处理组件
 * 监听 Electron 菜单操作并执行相应的动作
 */
export default function MenuHandler({
  onImportBook,
  onExportNotes,
  onOpenSettings,
  onShowAbout,
  onCheckUpdate,
}: MenuHandlerProps) {
  const router = useRouter();

  useEffect(() => {
    // 检查是否在 Electron 环境中
    if (typeof window === 'undefined' || !window.electronAPI) {
      return;
    }

    // 监听导航事件
    window.electronAPI.onNavigate((path: string) => {
      console.log('[MenuHandler] Navigate to:', path);
      router.push(path);
    });

    // 监听菜单操作事件
    window.electronAPI.onMenuAction((action: string) => {
      console.log('[MenuHandler] Menu action:', action);
      switch (action) {
        case 'import-book':
          onImportBook?.();
          break;
        case 'export-notes':
          onExportNotes?.();
          break;
        case 'open-settings':
          onOpenSettings?.();
          break;
        case 'show-about':
          onShowAbout?.();
          break;
        case 'check-update':
          onCheckUpdate?.();
          break;
        default:
          console.warn('[MenuHandler] Unknown action:', action);
      }
    });

    // 清理监听器
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeNavigateListener();
        window.electronAPI.removeMenuActionListener();
      }
    };
  }, [router, onImportBook, onExportNotes, onOpenSettings, onShowAbout, onCheckUpdate]);

  // 这是一个纯逻辑组件，不渲染任何内容
  return null;
}
