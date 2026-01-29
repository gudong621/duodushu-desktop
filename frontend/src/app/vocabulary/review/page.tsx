"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getVocabulary,
  updateVocabularyMastery,
  loadReviewSettings,
  saveReviewSettings,
  DEFAULT_REVIEW_COUNT,
} from "../../../lib/api";
import {
  ArrowLeftIcon,
  CheckIcon,
  SettingsIcon,
} from "../../../components/Icons";
import VocabDetailContent from "../../../components/VocabDetailContent";

interface VocabularyDetail {
  id: number;
  word: string;
  phonetic?: string;
  definition?: any;
  translation?: string;
  // ... 其他字段在 VocabDetailContent 内部重新获取，这里只需最基础的用于列表展示
  review_count: number;
  mastery_level: number;
  difficulty_score: number;
  priority_score: number;
}

export default function ReviewPage() {
  const router = useRouter();
  const [vocabList, setVocabList] = useState<VocabularyDetail[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [reviewCount, setReviewCount] = useState<number>(DEFAULT_REVIEW_COUNT);

  const currentVocab = vocabList[currentIndex];

  useEffect(() => {
    const settings = loadReviewSettings();
    setReviewCount(settings.reviewCount);
    // 加载数据放在这里，确保 reviewCount 已初始化 (虽然 setState 是异步的，但这里作为初始加载逻辑)
    // 更好的方式是将 loadVocab 独立调用，并依赖 reviewCount
  }, []);

  const loadVocab = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getVocabulary(
        undefined,  // bookId
        1,          // page
        reviewCount, // limit
        'all',      // filterType
        undefined,  // search
        'priority_score'  // sortBy
      );

      const items = Array.isArray(data) ? data : (data.items || []);
      if (items.length === 0) {
        // 不跳转，直接显示空状态
        setVocabList([]);
      } else {
        setVocabList(items);
        setCurrentIndex(0);
        setShowDefinition(false);
      }
    } catch (e) {
      console.error("加载单词列表失败:", e);
      alert("加载失败");
    } finally {
      setLoading(false);
    }
  }, [reviewCount]);

  useEffect(() => {
    loadVocab();
  }, [loadVocab]);

  /* Moved loadVocab up */

  const handleForgot = async () => {
    if (!currentVocab) return;
    try {
      await updateVocabularyMastery(currentVocab.id, {
        mastery_level: 1,
        difficulty_score: currentVocab.difficulty_score + 1,
        review_count: currentVocab.review_count + 1,
        last_reviewed_at: new Date().toISOString(),
      });
      setShowDefinition(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVague = async () => {
    if (!currentVocab) return;
    try {
      await updateVocabularyMastery(currentVocab.id, {
        mastery_level: Math.max(1, currentVocab.mastery_level - 1),
        difficulty_score: currentVocab.difficulty_score + 1,
        review_count: currentVocab.review_count + 1,
        last_reviewed_at: new Date().toISOString(),
      });
      setShowDefinition(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemembered = async () => {
    if (!currentVocab) return;
    try {
      await updateVocabularyMastery(currentVocab.id, {
        mastery_level: Math.min(5, currentVocab.mastery_level + 1),
        review_count: currentVocab.review_count + 1,
        last_reviewed_at: new Date().toISOString(),
      });
      goToNext();
    } catch (e) {
      console.error(e);
    }
  };

  const goToNext = () => {
    setShowDefinition(false);
    if (vocabList.length === 0) return;
    if (currentIndex < vocabList.length - 1) {
      setCurrentIndex((c) => c + 1);
    } else {
      setShowCompletionDialog(true);
    }
  };

  const handleReviewCountChange = (value: number) => {
    setReviewCount(value);
    saveReviewSettings({ reviewCount: value });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (vocabList.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="mb-4">暂无需要复习的生词</p>
          <button
            onClick={() => router.push("/vocabulary")}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            返回生词本
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* 顶部导航栏 */}
      <header className="border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 bg-white z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/vocabulary")}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            退出复习
          </button>
          <h1 className="font-bold text-gray-900">单词复习</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {vocabList.length}
          </span>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 进度条 */}
      <div className="w-full bg-gray-100 h-1 sticky top-[60px] z-40">
        <div
          className="bg-gray-900 h-1 transition-all"
          style={{
            width: `${((currentIndex + 1) / vocabList.length) * 100}%`,
          }}
        />
      </div>

      {/* 主要内容区 */}
      <main className="flex-1 overflow-hidden relative">
        {!showDefinition ? (
          // 折叠状态 - 简约居中卡片
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="text-center mb-16 scale-110">
              <h1 className="text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                {currentVocab.word}
              </h1>
              {currentVocab.phonetic && (
                <p className="text-2xl text-gray-400 font-mono">
                  /{currentVocab.phonetic}/
                </p>
              )}
            </div>

            {/* 评级按钮 - 极简白底风格 */}
            <div className="flex gap-6 w-full max-w-lg">
              <button
                onClick={handleForgot}
                className="flex-1 py-4 bg-white border-2 border-gray-200 hover:border-gray-900 text-gray-900 rounded-xl font-medium transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                不记得
              </button>
              <button
                onClick={handleVague}
                className="flex-1 py-4 bg-white border-2 border-gray-200 hover:border-gray-900 text-gray-900 rounded-xl font-medium transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                模糊
              </button>
              <button
                onClick={handleRemembered}
                className="flex-1 py-4 bg-white border-2 border-gray-200 hover:border-gray-900 text-gray-900 rounded-xl font-medium transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                记得
              </button>
            </div>
          </div>
        ) : (
          // 展开状态 - 复用 VocabDetailContent
          <VocabDetailContent
            vocabId={currentVocab.id}
            showBackButton={false}
            backUrl="/vocabulary"
            isLearnMode={true} // 启用学习模式布局（无返回按钮，适配容器）
            bottomBar={
              <div className="bg-white/70 backdrop-blur-xl shadow-xl rounded-full p-1.5 flex items-center gap-1 border border-white/20">
                <button
                  onClick={() => router.push("/vocabulary")}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 text-gray-400 transition-all"
                  title="退出复习"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="w-px h-4 bg-gray-200 mx-1"></div>

                <button
                  onClick={goToNext}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 text-white hover:bg-black shadow-md hover:shadow-lg transition-all"
                  title="下一词"
                >
                  <ArrowLeftIcon className="w-4 h-4 rotate-180" />
                </button>
              </div>
            }
          />
        )}
      </main>

      {/* 设置对话框 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">复习设置</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                每次复习单词数量
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={reviewCount}
                onChange={(e) => setReviewCount(parseInt(e.target.value) || DEFAULT_REVIEW_COUNT)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  handleReviewCountChange(reviewCount);
                  setShowSettings(false);
                }}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 完成对话框 */}
      {showCompletionDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md w-full text-center">
            <div className="flex justify-center mb-6">
              <CheckIcon className="w-16 h-16 text-gray-900" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              复习完成
            </h2>
            <p className="text-gray-600 mb-8">所有生词都复习完了！</p>
            <button
              onClick={() => router.push("/vocabulary")}
              className="w-full px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-all"
            >
              返回生词本
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
