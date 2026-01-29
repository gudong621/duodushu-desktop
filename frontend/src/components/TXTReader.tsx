"use client";

import { useMemo } from 'react';

interface TXTReaderProps {
  textContent?: string;
  onWordClick?: (word: string, context?: string) => void;
}

export default function TXTReader({
  textContent,
  onWordClick,
}: TXTReaderProps) {

  const tokens = useMemo(() => {
    if (!textContent) return [];

    // 分词：保留单词和标点
    return textContent.match(/([a-zA-ZÀ-ÿ]+(?:[''s]*[a-zA-Z]+)*|[.,;:!?""''()\[\]{}—-]+)/g) || [];
  }, [textContent]);

  if (!textContent || tokens.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>暂无内容</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 flex justify-center p-8">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-lg p-8 md:p-12">
        <div className="prose prose-xl max-w-none font-serif leading-loose text-gray-800">
          {tokens.map((token, index) => {
            const isWord = /^[a-zA-ZÀ-ÿ]+/.test(token);

            return isWord ? (
              <span
                key={index}
                className="cursor-pointer hover:bg-yellow-200 hover:text-blue-700 rounded-sm transition-colors"
                onClick={() => onWordClick?.(token)}
              >
                {token}
              </span>
            ) : (
              <span key={index}>{token}</span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
