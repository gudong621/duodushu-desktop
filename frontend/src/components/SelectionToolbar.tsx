"use client";

import { useEffect, useState, useCallback } from "react";

interface SelectionState {
  text: string;
  x: number;
  y: number;
  source?: string;
  rect?: DOMRect;
}

interface SelectionToolbarProps {
  selection: SelectionState | null;
  onNote?: (text: string, source?: string) => void;
  onAskAI?: (text: string, source?: string) => void;
  onLookup?: (text: string) => void;
  onCopy?: (text: string) => void;
  onClear?: () => void;
  hidden?: boolean;
}

export default function SelectionToolbar({
  selection,
  onNote,
  onAskAI,
  onLookup,
  onCopy,
  onClear,
  hidden = false,
}: SelectionToolbarProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  // 计算工具栏位置，避免超出视口
  const calculatePosition = useCallback(() => {
    if (!selection || hidden) {
      setPosition(null);
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const toolbarWidth = 220; // 估算宽度
    const toolbarHeight = 50; // 估算高度

    let x = selection.x;
    let y = selection.y - 10; // 默认在选择内容上方

    // 确保不超出视口
    if (x + toolbarWidth / 2 > viewportWidth) {
      x = viewportWidth - toolbarWidth / 2 - 20;
    }
    if (x - toolbarWidth / 2 < 0) {
      x = toolbarWidth / 2 + 20;
    }
    if (y < 20) {
      y = selection.rect?.bottom ? selection.rect.bottom + 10 : selection.y + 30;
    }
    if (y + toolbarHeight > viewportHeight) {
      y = viewportHeight - toolbarHeight - 20;
    }

    setPosition({ x, y });
  }, [selection, hidden]);

  useEffect(() => {
    calculatePosition();
  }, [calculatePosition]);

  // 处理操作
  const handleNote = () => {
    if (!selection) return;
    onNote?.(selection.text, selection.source);
    onClear?.();
  };

  const handleAskAI = () => {
    if (!selection) return;
    onAskAI?.(selection.text, selection.source);
    onClear?.();
  };

  const handleLookup = () => {
    if (!selection) return;
    onLookup?.(selection.text);
    onClear?.();
  };

  const handleCopy = async () => {
    if (!selection) return;
    try {
      await navigator.clipboard.writeText(selection.text);
      onCopy?.(selection.text);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
    onClear?.();
  };

  if (!selection || !position || hidden) return null;

  return (
    <div
      data-selection-toolbar="true"
      className="fixed z-[9999] bg-gray-900 text-white rounded-lg shadow-2xl flex items-center gap-1 p-1 transform transition-all duration-200 animate-in fade-in zoom-in-95 select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)',
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* 记笔记按钮 */}
      {onNote && (
        <div className="relative group">
          <button
            onClick={handleNote}
            className="flex items-center justify-center w-8 h-8 hover:bg-gray-700 rounded-md transition-colors"
          >
            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            记笔记
          </div>
        </div>
      )}

      {/* 分隔线 */}
      {(onNote && (onAskAI || onLookup || onCopy)) && (
        <div className="w-px h-4 bg-gray-700 mx-0.5"></div>
      )}

      {/* 问老师按钮 */}
      {onAskAI && (
        <div className="relative group">
          <button
            onClick={handleAskAI}
            className="flex items-center justify-center w-8 h-8 hover:bg-gray-700 rounded-md transition-colors"
          >
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            问老师
          </div>
        </div>
      )}

      {/* 分隔线 */}
      {(onAskAI && onLookup) && (
        <div className="w-px h-4 bg-gray-700 mx-0.5"></div>
      )}

      {/* 查词典按钮 */}
      {onLookup && (
        <div className="relative group">
          <button
            onClick={handleLookup}
            className="flex items-center justify-center w-8 h-8 hover:bg-gray-700 rounded-md transition-colors"
          >
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18c1.747 0 3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332-.477-4.5-1.253M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" />
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            查词典
          </div>
        </div>
      )}

      {/* 分隔线 */}
      {(onLookup && onCopy) && (
        <div className="w-px h-4 bg-gray-700 mx-0.5"></div>
      )}

      {/* 复制按钮 */}
      {onCopy && (
        <div className="relative group">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center w-8 h-8 hover:bg-gray-700 rounded-md transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            复制
          </div>
        </div>
      )}



      {/* 箭头 */}
      <div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900"
        style={{ display: position?.y < 50 ? 'none' : 'block' }}
      ></div>
    </div>
  );
}
