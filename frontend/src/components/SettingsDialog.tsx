/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../lib/api';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const [geminiKey, setGeminiKey] = useState('');
  const [deepseekKey, setDeepseekKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [configured, setConfigured] = useState({ gemini: false, deepseek: false });

  // 加载当前配置状态
  useEffect(() => {
    if (isOpen) {
      loadConfigStatus();
    }
  }, [isOpen]);

  const loadConfigStatus = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/config/api-keys`);
      if (response.ok) {
        const data = await response.json();
        setConfigured({
          gemini: data.gemini_configured,
          deepseek: data.deepseek_configured,
        });
      }
    } catch (error) {
      console.error('Failed to load config status:', error);
    }
  };

  const handleSave = async () => {
    if (!geminiKey && !deepseekKey) {
      setMessage({ type: 'error', text: '请至少输入一个 API Key' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${getApiUrl()}/api/config/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gemini_api_key: geminiKey,
          deepseek_api_key: deepseekKey,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: 'API Keys 已保存' });
        setConfigured({
          gemini: data.gemini_configured,
          deepseek: data.deepseek_configured,
        });
        // 清空输入框
        setGeminiKey('');
        setDeepseekKey('');
        // 2秒后关闭对话框
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.detail || '保存失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '保存失败，请检查网络连接' });
      console.error('Failed to save API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">API 配置</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Gemini API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Gemini API Key
              {configured.gemini && (
                <span className="ml-2 text-xs text-green-600">✓ 已配置</span>
              )}
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="输入你的 Gemini API Key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              从 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a> 获取
            </p>
          </div>

          {/* DeepSeek API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DeepSeek API Key
              {configured.deepseek && (
                <span className="ml-2 text-xs text-green-600">✓ 已配置</span>
              )}
            </label>
            <input
              type="password"
              value={deepseekKey}
              onChange={(e) => setDeepseekKey(e.target.value)}
              placeholder="输入你的 DeepSeek API Key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              从 <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">DeepSeek 平台</a> 获取
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-sm font-medium"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 rounded-md transition-colors text-sm font-medium"
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
