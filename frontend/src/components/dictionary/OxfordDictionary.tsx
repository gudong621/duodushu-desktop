"use client";

import { useRef, useEffect, memo } from "react";
import useDictionaryAudio from '../../hooks/useDictionaryAudio';

interface OxfordDictionaryProps {
  word: string;
  htmlContent: string;
}

function OxfordDictionary({ word, htmlContent }: OxfordDictionaryProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useDictionaryAudio({
    source: "牛津",
    word: word,
    htmlContent: htmlContent,
    contentRef: contentRef,
  });

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    // 确保牛津词典显示
    const oald = container.querySelector('.oald');
    if (oald) {
      (oald as HTMLElement).style.display = 'block';
    }

    // 添加音频图标样式
    const audioIcons = container.querySelectorAll('.phons_br a, .phons_n_am a');
    audioIcons.forEach((icon) => {
      icon.classList.add('audio-icon');
    });

    // 重新初始化 oaldpe 以绑定事件监听器（在 DOM 渲染后）
    const timer = setTimeout(() => {
      if ((window as any).oaldpeInit?.main) {
        console.log('[Oxford] Re-initializing oaldpe for new content');
        (window as any).oaldpeInit.main();

        // 确保折叠块默认折叠，并绑定点击事件
        setTimeout(() => {
          const container = contentRef.current;
          if (!container) return;

          // ========== 1. 处理 .collapse .unbox 折叠块 ==========
          const unboxes = container.querySelectorAll('.collapse .unbox');
          console.log(`[Oxford] Found ${unboxes.length} unboxes`);

          let boundCount = 0;

          unboxes.forEach((unbox: Element) => {
            const unboxEl = unbox as HTMLElement;
            const boxTitle = unboxEl.querySelector('.box_title') as HTMLElement;

            if (boxTitle) {
              // 1. 移除旧的绑定标记
              boxTitle.removeAttribute('data-oaldpe-bound');
              unboxEl.removeAttribute('data-oaldpe-initialized');

              // 2. 查找内容元素
              const content = boxTitle.nextElementSibling as HTMLElement;

              if (content) {
                // 3. 默认折叠状态
                content.style.display = 'none';
                unboxEl.classList.remove('is-active');

                // 4. 手动绑定点击事件（确保点击功能）
                const newBoxTitle = boxTitle.cloneNode(true) as HTMLElement;
                boxTitle.parentNode?.replaceChild(newBoxTitle, boxTitle);

                // 绑定新的事件
                newBoxTitle.addEventListener('click', (event) => {
                  event.stopPropagation();
                  console.log('[Oxford] Click unbox:', unboxEl.getAttribute('unbox'));

                  if (unboxEl.classList.contains('is-active')) {
                    // 收起：隐藏内容
                    content.style.display = 'none';
                  } else {
                    // 展开：显示内容
                    content.style.display = 'block';
                  }
                  unboxEl.classList.toggle('is-active');
                });

                // 设置标记
                newBoxTitle.setAttribute('data-oaldpe-bound', 'true');
                unboxEl.setAttribute('data-oaldpe-initialized', 'true');
                boundCount++;
              }
            }
          });

          // ========== 2. 处理 .idioms 和 .phrasal_verb_links 区域 ==========
          const phraseSections = container.querySelectorAll('.idioms, .phrasal_verb_links');
          console.log(`[Oxford] Found ${phraseSections.length} phrase sections (idioms/phrasal verbs)`);

          let phraseBoundCount = 0;

          phraseSections.forEach((section: Element) => {
            const sectionEl = section as HTMLElement;
            const isIdioms = sectionEl.classList.contains('idioms');
            
            // 获取标题元素
            const heading = isIdioms 
              ? sectionEl.querySelector('.idioms_heading') as HTMLElement
              : sectionEl.querySelector(':scope > .unbox') as HTMLElement;
            
            if (!heading) return;

            // 获取内容元素（除了标题之外的所有子元素）
            const contentElements = Array.from(sectionEl.children).filter(
              child => child !== heading
            ) as HTMLElement[];

            // 1. 移除旧的绑定标记
            heading.removeAttribute('data-oaldpe-bound');
            sectionEl.removeAttribute('data-oaldpe-initialized');

            // 2. 默认折叠状态
            contentElements.forEach(el => {
              el.style.display = 'none';
            });
            sectionEl.classList.remove('expanded');

            // 3. 克隆标题并重新绑定事件
            const newHeading = heading.cloneNode(true) as HTMLElement;
            heading.parentNode?.replaceChild(newHeading, heading);

            // 4. 绑定点击事件
            newHeading.addEventListener('click', (event) => {
              const target = event.target as HTMLElement;
              // 排除返回按钮的点击
              if (target.classList.contains('jumplink_back')) return;
              
              event.stopPropagation();
              console.log('[Oxford] Click phrase section:', isIdioms ? 'idioms' : 'phrasal_verb_links');

              if (sectionEl.classList.contains('expanded')) {
                // 收起：隐藏内容
                contentElements.forEach(el => {
                  el.style.display = 'none';
                });
              } else {
                // 展开：显示内容
                contentElements.forEach(el => {
                  el.style.display = 'block';
                });
              }
              sectionEl.classList.toggle('expanded');
            });

            // 设置标记
            newHeading.setAttribute('data-oaldpe-bound', 'true');
            sectionEl.setAttribute('data-oaldpe-initialized', 'true');
            phraseBoundCount++;
          });

          console.log(`[Oxford] Bound ${boundCount} unbox events, ${phraseBoundCount} phrase section events (default collapsed)`);
        }, 500);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [htmlContent]);

  return (
    <div
      ref={contentRef}
      className="dictionary-scope-oxford dictionary-container"
      data-dict="oxford"
      data-word={word}
    >
      <div className="oaldpe" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}

export default memo(OxfordDictionary);
