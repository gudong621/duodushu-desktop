"use client";

import React from "react";

interface ClickableTextProps {
  text: string;
  onWordClick: (word: string, context?: string) => void;
  className?: string;
}

/**
 * 可点击文本组件 - 将文本拆分成可点击的单词
 * 点击单词时会触发 onWordClick 回调，支持查词典等功能
 */
export default function ClickableText({
  text,
  onWordClick,
  className = "",
}: ClickableTextProps) {
  // 将文本拆分成单词和非单词部分
  const parts = text.split(/(\s+|[,.!?;:'"()[\]{}—–-]+)/);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // 如果是空白或标点，直接渲染
        if (/^[\s,.!?;:'"()[\]{}—–-]+$/.test(part) || part.trim() === "") {
          return <span key={index}>{part}</span>;
        }

        // 提取纯单词（去除可能附带的标点）
        const cleanWord = part.replace(/[^a-zA-Z'-]/g, "").toLowerCase();

        if (!cleanWord) {
          return <span key={index}>{part}</span>;
        }

        return (
          <span
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              onWordClick(cleanWord, text);
            }}
            className="cursor-pointer hover:bg-yellow-100 hover:text-yellow-900 transition-colors duration-150"
            title={`查词：${cleanWord}`}
          >
            {part}
          </span>
        );
      })}
    </span>
  );
}
