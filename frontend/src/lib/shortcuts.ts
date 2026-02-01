/**
 * 快捷键定义文件
 * 定义应用全局快捷键和阅读器快捷键
 */

import { KeyboardShortcutConfig } from '../hooks/useKeyboardShortcuts';

/**
 * 阅读器快捷键配置
 */
export const createReaderShortcuts = (
  goPrevPage: () => void,
  goNextPage: () => void,
  toggleDictionary: () => void,
  toggleAI: () => void,
  toggleNotes: () => void,
  closeSidebar: () => void
): KeyboardShortcutConfig[] => [
  {
    key: 'ArrowLeft',
    action: goPrevPage,
    description: '上一页',
  },
  {
    key: 'ArrowRight',
    action: goNextPage,
    description: '下一页',
  },
  {
    key: 'PageUp',
    action: goPrevPage,
    description: '上一页',
  },
  {
    key: 'PageDown',
    action: goNextPage,
    description: '下一页',
  },
  {
    key: 'd',
    action: toggleDictionary,
    description: '打开/关闭词典侧边栏',
  },
  {
    key: 'a',
    action: toggleAI,
    description: '打开/关闭 AI 老师侧边栏',
  },
  {
    key: 'n',
    action: toggleNotes,
    description: '打开/关闭笔记侧边栏',
  },
  {
    key: 'Escape',
    action: closeSidebar,
    description: '关闭侧边栏/弹窗',
  },
];

/**
 * 书架页面快捷键配置
 */
export const createHomeShortcuts = (
  openUpload: () => void,
  openSettings: () => void,
  closeAllDialogs: () => void
): KeyboardShortcutConfig[] => [
  {
    key: 'k',
    ctrlKey: true,
    action: openUpload,
    description: '打开上传对话框 (Ctrl+K)',
  },
  {
    key: ',',
    ctrlKey: true,
    action: openSettings,
    description: '打开设置 (Ctrl+,)',
  },
  {
    key: 'Escape',
    action: closeAllDialogs,
    description: '关闭所有弹窗',
  },
];

/**
 * 快捷键标题映射（用于按钮 title 属性）
 */
export const SHORTCUT_TITLES: Record<string, string> = {
  dictionary: '词典 (D)',
  ai: 'AI 老师 (A)',
  notes: '笔记 (N)',
  prevPage: '上一页 (←)',
  nextPage: '下一页 (→)',
  upload: '上传 (Ctrl+K)',
  settings: '设置 (Ctrl+,)',
};
