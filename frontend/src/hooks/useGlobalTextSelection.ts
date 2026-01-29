"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface SelectionState {
  text: string;
  x: number;
  y: number;
  source?: 'pdf' | 'epub' | 'dictionary' | 'ai' | 'notes' | 'vocab' | 'general';
  rect: DOMRect;
}

export function useGlobalTextSelection(
  enabled: boolean = true,
  excludeSelectors: string[] = []
) {
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSelectionTextRef = useRef<string>("");
  const lastSelectionRangeRef = useRef<Range | null>(null);
  const isMouseDownRef = useRef<boolean>(false);
  const mouseUpPositionRef = useRef<{ x: number; y: number } | null>(null);

  const clearSelection = useCallback(() => {
    setSelection(null);
    const sel = window.getSelection();
    if (sel) sel.removeAllRanges();
  }, []);

  const isSelectionExcluded = useCallback((node: Node | null): boolean => {
    if (!node) return false;
    const element = node.nodeType === Node.ELEMENT_NODE
      ? node as HTMLElement
      : node.parentElement;

    if (!element) return false;

    return excludeSelectors.some(selector => {
      try {
        return element.closest(selector) !== null;
      } catch {
        return false;
      }
    });
  }, [excludeSelectors]);

  const handleSelectionChange = useCallback(() => {
    if (!enabled) return;

    // 清除之前的延迟
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    // 延迟执行，避免快速点击时误触发
    selectionTimeoutRef.current = setTimeout(() => {
      // 如果鼠标还在按下状态，不触发工具条（等待松开后确认）
      if (isMouseDownRef.current) {
        return;
      }
      const sel = window.getSelection();

      if (!sel || sel.isCollapsed) {
        setSelection(null);
        lastSelectionTextRef.current = "";
        lastSelectionRangeRef.current = null;
        return;
      }

      // 检查选择是否在排除区域内
      if (sel.anchorNode && isSelectionExcluded(sel.anchorNode)) {
        return;
      }

      const text = sel.toString().trim();

      if (!text) {
        setSelection(null);
        lastSelectionTextRef.current = "";
        lastSelectionRangeRef.current = null;
        return;
      }
      // 限制最小选择长度，避免单字符误触
      if (text.length < 3) {
        setSelection(null);
        lastSelectionTextRef.current = "";
        lastSelectionRangeRef.current = null;
        return;
      }

      // 检测"全选误触"：如果选择长度突然增加超过 10 倍，可能是拖到边界导致全选
      const prevLength = lastSelectionTextRef.current.length;
      if (prevLength > 10 && text.length > prevLength * 10) {
        // 可能是误触全选，忽略
        return;
      }

      // 限制最大选择长度（防止选中整个页面）
      if (text.length > 1000) {
        setSelection(null);
        lastSelectionTextRef.current = "";
        lastSelectionRangeRef.current = null;
        return;
      }

      // 如果选择的内容没有变化，不重复触发
      if (text === lastSelectionTextRef.current) {
        // 但更新位置（可能用户滚动了页面）
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (selection && selection.text === text) {
          setSelection(prev => prev ? { ...prev, x: rect.left + rect.width / 2, y: rect.top, rect } : null);
        }
        return;
      }

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // 检测选择区域尺寸：如果超出合理范围，可能是跨区域误选
      // 高度超过 500px 或宽度超过 1200px 视为异常
      if (rect.height > 500 || rect.width > 1200) {
        setSelection(null);
        lastSelectionTextRef.current = "";
        lastSelectionRangeRef.current = null;
        return;
      }

      // 检测鼠标松开位置是否在选择区域附近（300px 范围内）
      // 如果鼠标跑太远说明是误触全选
      if (mouseUpPositionRef.current) {
        const mouseX = mouseUpPositionRef.current.x;
        const mouseY = mouseUpPositionRef.current.y;
        const distanceToRect = Math.min(
          Math.abs(mouseX - rect.left),
          Math.abs(mouseX - rect.right),
          Math.abs(mouseY - rect.top),
          Math.abs(mouseY - rect.bottom)
        );
        // 如果鼠标距离选择区域超过 300px，忽略
        if (distanceToRect > 300) {
          setSelection(null);
          lastSelectionTextRef.current = "";
          lastSelectionRangeRef.current = null;
          return;
        }
      }

      // 智能识别选择来源
      let source: SelectionState['source'] = 'general';
      const container = range.commonAncestorContainer;
      let element = container.nodeType === Node.ELEMENT_NODE
        ? container as HTMLElement
        : container.parentElement;

      // 向上查找识别来源
      while (element && element !== document.body) {
        if (element.closest('.pdf-text-layer') ||
            element.closest('#pdf-canvas') ||
            element.closest('[data-reader-type="pdf"]')) {
          source = 'pdf';
          break;
        }
        if (element.closest('.epub-viewer') ||
            element.closest('[data-reader-type="epub"]')) {
          source = 'epub';
          break;
        }
        if (element.closest('[class*="dictionary"]') ||
            element.closest('[class*="Dictionary"]')) {
          source = 'dictionary';
          break;
        }
        if (element.closest('[class*="ai"]') ||
            element.closest('[class*="teacher"]') ||
            element.closest('[class*="AITeacher"]')) {
          source = 'ai';
          break;
        }
        if (element.closest('[class*="notes"]') ||
            element.closest('[class*="Notes"]')) {
          source = 'notes';
          break;
        }
        if (element.closest('[class*="vocab"]') ||
            element.closest('[class*="Vocabulary"]') ||
            element.closest('[data-page-type="vocab-detail"]')) {
          source = 'vocab';
          break;
        }
        element = element.parentElement;
      }

      // 调整位置，避免工具栏超出视口
      const adjustedY = Math.max(60, rect.top); // 至少距离顶部60px
      const viewportWidth = window.innerWidth;
      const adjustedX = Math.min(Math.max(rect.left + rect.width / 2, 60), viewportWidth - 60);

      setSelection({
        text,
        x: adjustedX,
        y: adjustedY,
        source,
        rect,
      });

      lastSelectionRangeRef.current = range;
    }, 300);  // 增加防抖时间到 300ms
  }, [enabled, isSelectionExcluded, selection]);

  // 监听文本选择事件
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('selectionchange', handleSelectionChange);
    
    // 监听 EPUB iframe 中的文本选择事件
    const handleEpubSelection = (e: any) => {
      console.log('[GlobalSelection] Received epub-text-selected event:', e);
      if (!e.detail) {
        console.log('[GlobalSelection] No detail in event');
        return;
      }
      
      const { text, x, y, source, rect } = e.detail;
      console.log('[GlobalSelection] Text selected in EPUB:', text, 'at', x, y);
      
      setSelection({
        text,
        x,
        y,
        source,
        rect: rect || { left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 }
      });
      
      lastSelectionTextRef.current = text;
    };
    
    document.addEventListener('epub-text-selected', handleEpubSelection);
    
    // 监听 EPUB 点击清除选择事件
    const handleEpubClearSelection = () => {
      setSelection(null);
      lastSelectionTextRef.current = "";
    };
    
    document.addEventListener('epub-clear-selection', handleEpubClearSelection);

    // 监听点击事件，用于清除选择
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // 如果点击的不是工具栏内部，清除选择
      if (!target.closest('[data-selection-toolbar]')) {
        // 延迟清除，给工具栏操作留出时间
        setTimeout(() => {
          setSelection(null);
          lastSelectionTextRef.current = "";
        }, 100);
      }
    };

    document.addEventListener('click', handleClickOutside);

    // 监听鼠标按下/松开事件，用于确认选择
    const handleMouseDown = () => {
      isMouseDownRef.current = true;
    };

    const handleMouseUp = (e: MouseEvent) => {
      isMouseDownRef.current = false;
      // 记录鼠标松开位置
      mouseUpPositionRef.current = { x: e.clientX, y: e.clientY };
      // 松开鼠标后延迟触发选择检测，给用户时间调整选择范围
      setTimeout(() => {
        handleSelectionChange();
      }, 200);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('epub-text-selected', handleEpubSelection);
      document.removeEventListener('epub-clear-selection', handleEpubClearSelection);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, [enabled, handleSelectionChange]);

  return {
    selection,
    clearSelection,
  };
}
