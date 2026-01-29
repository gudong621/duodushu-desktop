"use client";

import { useRef, useEffect, memo } from "react";
import useDictionaryAudio from '../../hooks/useDictionaryAudio';
// import styles from './LongmanDictionary.module.scss';

interface LongmanDictionaryProps {
  word: string;
  htmlContent: string;
}

function LongmanDictionary({
  word,
  htmlContent,
}: LongmanDictionaryProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useDictionaryAudio({
    source: "朗文",
    word: word,
    htmlContent: htmlContent,
    contentRef: contentRef,
  });

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    // 确保朗文词典显示
    const lm6 = container.querySelector('.lm6');
    if (lm6) {
      (lm6 as HTMLElement).style.display = 'block';
    }

    // 添加音频图标样式
    const audioIcons = container.querySelectorAll('.hwdbre, .hwdame');
    audioIcons.forEach((icon) => {
      icon.classList.add('audio-icon');
    });
  }, [htmlContent]);

  return (
    <div
      ref={contentRef}
      className="dictionary-scope-longman dictionary-container"
      data-dict="longman"
      data-word={word}
    >
      <div
        className="lm6"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}

export default memo(LongmanDictionary);
