'use client';

import { useEffect } from 'react';

/**
 * 键盘快捷键配置接口
 */
export interface KeyboardShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean; // macOS Command key
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

/**
 * 键盘快捷键 Hook
 * @param shortcuts 快捷键配置数组
 * @param enabled 是否启用
 */
export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcutConfig[],
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // 忽略输入框中的快捷键
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          (event.target as HTMLElement)?.isContentEditable) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = !shortcut.ctrlKey || event.ctrlKey || event.metaKey;
        const metaMatch = !shortcut.metaKey || event.metaKey;
        const shiftMatch = !shortcut.shiftKey || event.shiftKey;

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch) {
          event.preventDefault();
          shortcut.action();
          return; // 只触发第一个匹配的快捷键
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
};

export default useKeyboardShortcuts;
