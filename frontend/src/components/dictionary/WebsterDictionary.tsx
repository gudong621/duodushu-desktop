"use client";

import { useRef, useEffect, memo } from "react";
import useDictionaryAudio from '../../hooks/useDictionaryAudio';
// import styles from './WebsterDictionary.module.css';

interface WebsterDictionaryProps {
  word: string;
  htmlContent: string;
}

function WebsterDictionary({ word, htmlContent }: WebsterDictionaryProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const { playWordTTS, playTTSFallback } = useDictionaryAudio({
    source: "韦氏",
    word: word,
    htmlContent: htmlContent,
    contentRef: contentRef,
  });

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    // 确保韦氏词典显示
    const maldpe = container.querySelector('.maldpe');
    if (maldpe) {
      (maldpe as HTMLElement).style.display = 'block';
    }

    // --- FIX: Inject Audio Icons for Examples ---
    // Only select the container 'li.vi' to avoid selecting both parent and child (li.vi and .vi_content)
    const examples = container.querySelectorAll('li.vi');
    examples.forEach((li) => {
      // Determine the target container for the icon.
      // Usually .vi_content is inside li.vi. We prefer .vi_content if it exists.
      const target = li.querySelector('.vi_content') || li;

      // Avoid duplicate injection in the target
      // check direct children for class 'webster-audio-icon' to be safe, 
      // or querySelector assuming we control the class name unique enough.
      if (target.querySelector('.webster-audio-icon')) return;

      // 使用 Emoji 喇叭图标，与朗文/牛津保持一致
      const icon = document.createElement('span');
      icon.className = 'webster-audio-icon';
      icon.textContent = '🔊';
      icon.setAttribute('aria-hidden', 'true');

      // Bind click event to play TTSFallback
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        playTTSFallback(li as HTMLElement); // Use the li (sentence container) for TTS text extraction
      });

      // Append to the target container
      target.prepend(icon);
    });

    // --- FIX: Ensure Word Pronunciation Icons work ---
    const wordAudioIcons = container.querySelectorAll('.hpron_icon, .fa-volume-up, .webster-word-audio');
    wordAudioIcons.forEach((icon) => {
      // 如果是旧的 FontAwesome 类，替换为 Emoji
      if ((icon as HTMLElement).classList.contains('fa-volume-up')) {
        (icon as HTMLElement).classList.remove('fa', 'fa-volume-up');
        (icon as HTMLElement).classList.add('webster-word-audio');
        (icon as HTMLElement).textContent = '🔊';
      }
      icon.classList.add('audio-icon');
      // Ensure they have the pointer cursor
      (icon as HTMLElement).style.cursor = 'pointer';

      // Bind click to playWordTTS
      // Remove old listeners? Hard to do without reference, but checking generic logic
      // We rely on the fact that this runs once per htmlContent change.
      icon.addEventListener('click', (e) => {
         e.stopPropagation();
         // Try to find specific word if attached to the icon, else use the global component word
         // Some Webster entries might have multiple pronunciations?
         // For now, playing the main word is safer/better than nothing.
         console.log("Word audio icon clicked, playing:", word);
         playWordTTS(word);
      });
    });

  }, [htmlContent, playTTSFallback, playWordTTS, word]);

  return (
    <div
      ref={contentRef}
      className="dictionary-scope-webster dictionary-container"
      data-dict="webster"
      data-word={word}
    >
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}

export default memo(WebsterDictionary);
