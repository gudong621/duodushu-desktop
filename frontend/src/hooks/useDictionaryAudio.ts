"use client";

import { useEffect, useCallback } from "react";

interface UseDictionaryAudioProps {
  source: string;
  word: string;
  htmlContent: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

export function useDictionaryAudio({
  source,
  htmlContent,
  contentRef,
}: UseDictionaryAudioProps) {

  // 0. Play Word TTS (随机美音)
  const playWordTTS = useCallback(async (word: string) => {
    try {
      const { streamSpeech } = await import("../lib/api");
      const usVoices = [
        "en-US-MichelleNeural",
        "en-US-AriaNeural",
        "en-US-JennyNeural",
        "en-US-GuyNeural",
        "en-US-ChristopherNeural",
        "en-US-EricNeural",
        "en-US-RogerNeural",
      ];
      const randomVoice = usVoices[Math.floor(Math.random() * usVoices.length)];
      console.log(
        `[Webster TTS] Using Edge TTS (${randomVoice}) for word: ${word}`,
      );
      const blobUrl = await streamSpeech(word, randomVoice);
      const audio = new Audio(blobUrl);
      audio.onended = () => URL.revokeObjectURL(blobUrl);
      await audio.play();
    } catch (err) {
      console.error("Word TTS failed:", err);
    }
  }, []);

  // 1. Play TTS Fallback Logic
  const playTTSFallback = useCallback(async (targetElement: HTMLElement) => {
    let text = "";

    // 方法1: 查找例句文本
    const exampleEl =
      targetElement.closest(".example") ||
      targetElement.closest(".gramexa") ||
      targetElement.closest(".colloexa") ||
      targetElement.closest("li");
    if (exampleEl) {
      const clone = exampleEl.cloneNode(true) as HTMLElement;
      clone
        .querySelectorAll(
          "a.voice, expcn, .freq, .gloss, .ACTIV, .neutral, .REFHWD, .crossRef, var, .unx, .webster-audio-icon, .webster-word-audio, .audio-icon",
        )
        .forEach((el) => el.remove());
      text = (clone.innerText || clone.textContent || "").trim();
    }

    // 方法2: 查找单词标题
    if (!text) {
      const entry = targetElement.closest(".entry, .Head, .ldoceEntry");
      if (entry) {
        const headword = entry.querySelector(
          ".hwd, .HYPHENATION, h1, .headword",
        );
        if (headword) {
          text = headword.textContent?.trim() || "";
        }
      }
    }

    // 方法3: 从 href 提取单词名
    if (!text) {
      const href = targetElement.getAttribute("href") || "";
      const match = href.match(/\/([^\/]+)(?:_[^\/]*)?\.mp3$/i);
      if (match) {
        text = match[1].replace(/_.*$/, "");
      }
    }

    // 方法4: 获取下一个兄弟节点的文本
    if (!text) {
      const nextSibling = targetElement.nextSibling;
      text = nextSibling?.textContent?.trim() || "";
    }

    if (!text) return;

    // 清理文本
    text = text
      .replace(/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+/g, "") // 移除中文字符
      .replace(/\//g, ", ") // 替换斜杠为逗号
      .replace(/\\/g, ", ") // 替换反斜杠
      .replace(/\/\//g, "") // 移除可能的注释符
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[.。!！?？,，;；:：]+$/g, "") // 移除结尾标点
      .replace(/\s+\d+$/g, ""); // 移除结尾的纯数字

    if (!text) return;

    try {
      const { bingSpeechService } = await import("../lib/BingSpeechService");
      const usVoices = [
        "en-US-MichelleNeural",
        "en-US-AriaNeural",
        "en-US-JennyNeural",
        "en-US-GuyNeural",
        "en-US-ChristopherNeural",
        "en-US-EricNeural",
        "en-US-RogerNeural",
      ];
      const randomVoice = usVoices[Math.floor(Math.random() * usVoices.length)];
      const config = {
        locale: "en-US",
        voice: randomVoice,
        pitch: "+0Hz",
        rate: "+0%",
        volume: "+0%",
      };

      console.log(`Using Edge TTS (${randomVoice}) for:`, text);
      const blobUrl = await bingSpeechService.playText(text, config);
      const audio = new Audio(blobUrl);
      audio.onended = () => URL.revokeObjectURL(blobUrl);
      await audio.play();
    } catch (err) {
      console.error("Frontend TTS failed:", err);
      try {
        console.log("Falling back to backend TTS API...");
        const { streamSpeech } = await import("../lib/api");
        const voice = "en-US-MichelleNeural";
        const blobUrl = await streamSpeech(text, voice);
        const audio = new Audio(blobUrl);
        audio.onended = () => URL.revokeObjectURL(blobUrl);
        await audio.play();
      } catch (backendErr) {
        console.error("Backend TTS also failed:", backendErr);
      }
    }
  }, []);

  // 2. Handle Voice Click logic
  const handleVoiceClick = useCallback(
    async (e: Event) => {
      const target = e.target as HTMLElement;

      // 优先处理韦氏词典的音频播放（使用 Edge TTS 随机美音）
      const link = target.closest("a");
      if (link && source === "韦氏") {
        const href = link.getAttribute("href");
        if (href && href.startsWith("sound://")) {
          e.preventDefault();
          e.stopPropagation();

          // 检查是否是音频文件（.mp3）
          if (!href.toLowerCase().endsWith(".mp3")) {
            console.log("Skipping non-audio sound:// link:", href);
            return;
          }

          // 提取单词（从 data-word 属性）
          const wordToPlay = link.getAttribute("data-word");
          if (wordToPlay) {
            console.log(
              `[Webster TTS] Playing word from data-word: ${wordToPlay}`,
            );
            await playWordTTS(wordToPlay);
            return;
          }

          // 降级方案：从 href 提取单词名
          const path = href.replace("sound://", "");
          const match = path.match(
            /pronunciations\/mp3\/[^\/]+\/([^\/]+)\.mp3$/i,
          );
          if (match) {
            const wordFromPath = match[1].replace(/\d+$/, ""); // 移除后缀数字
            console.log(
              `[Webster TTS] Playing word from path: ${wordFromPath}`,
            );
            await playWordTTS(wordFromPath);
            return;
          }

          console.warn(
            "[Webster TTS] Cannot extract word from sound:// link:",
            href,
          );
          return;
        }
      }

      if (source === "牛津") {
        const oxfordExampleLi = target.closest(".examples > li");
        const oxfordAudio = target.closest(
          "a.audio_play_button",
        ) as HTMLElement;
        if (oxfordExampleLi || oxfordAudio) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          const elementToSpeak = (oxfordAudio ||
            oxfordExampleLi) as HTMLElement;
          await playTTSFallback(elementToSpeak);
          return;
        }
      }

      if (source === "朗文当代" || source === "朗文") {
        const longmanAudio = target.closest(
          "a.voice, a.speaker, .speaker",
        ) as HTMLElement;
        if (longmanAudio) {
          e.preventDefault();
          e.stopPropagation();
          await playTTSFallback(longmanAudio);
          return;
        }
        const exampleEl = target.closest(".example");
        if (
          exampleEl &&
          (target.tagName === "LI" ||
            target.tagName === "SPAN" ||
            target.tagName === "DIV")
        ) {
          e.preventDefault();
          e.stopPropagation();
          await playTTSFallback(exampleEl as HTMLElement);
          return;
        }
      }
    },
    [source, playWordTTS, playTTSFallback],
  );

  // 3. Load Dependencies
  useEffect(() => {
    if (!htmlContent) return;

    const loadScript = (src: string, id: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
          if (id === "maldpe-jquery" && !(window as any).jQuery) {
            let checks = 0;
            const interval = setInterval(() => {
              checks++;
              if ((window as any).jQuery) {
                clearInterval(interval);
                resolve();
              }
              if (checks > 50) {
                clearInterval(interval);
                resolve();
              }
            }, 100);
            return;
          }
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.id = id;
        script.src = src;
        script.async = false;
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error(`Failed to load script: ${src}`));
        document.body.appendChild(script);
      });
    };

    const initDeps = async () => {
      try {
        if (source === "韦氏") {
          await loadScript(
            "/dictionaries/webster/maldpe-jquery-3.6.0.min.js",
            "maldpe-jquery",
          );
          await loadScript("/dictionaries/webster/maldpe.js", "maldpe-main");
          console.log("[Webster] Scripts loaded successfully");
        } else if (source === "牛津") {
          await loadScript(
            "/dictionaries/oxford/oaldpe-jquery.js",
            "oaldpe-jquery",
          );
          await loadScript("/dictionaries/oxford/oaldpe.js", "oaldpe-main");
          console.log("[Oxford] Scripts loaded successfully");
        } else if (source === "朗文当代" || source === "朗文") {
          await loadScript("/dictionaries/longman/lm6.js", "lm6-main");
          console.log("[Longman] Scripts loaded successfully");
        }
      } catch (error) {
        console.error(`Failed to load ${source} scripts:`, error);
      }
    };

    initDeps();
  }, [htmlContent, source]);

  // 4. Attach Click Listener
  useEffect(() => {
    if (!htmlContent || !contentRef.current) return;

    const container = contentRef.current;
    container.addEventListener(
      "click",
      handleVoiceClick as EventListener,
      true,
    );

    return () => {
      container.removeEventListener(
        "click",
        handleVoiceClick as EventListener,
        true,
      );
    };
  }, [htmlContent, contentRef, handleVoiceClick]);

  return {
    playWordTTS,
    playTTSFallback,
  };
}

export default useDictionaryAudio;
