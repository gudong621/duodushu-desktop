"use client";

import { useState } from 'react';
import { uploadBook } from '../lib/api';

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export default function UploadDialog({ isOpen, onClose, onUploadSuccess }: UploadDialogProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookType, setBookType] = useState<string>('normal');


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleUpload(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const supportedFormats = ['pdf', 'epub', 'txt'];
      if (!ext || !supportedFormats.includes(ext)) {
        throw new Error('目前支持 PDF、EPUB、TXT 格式');
      }
      await uploadBook(file, { book_type: bookType });
      onUploadSuccess();
      alert('上传成功！后台正在解析文档...');
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-lg max-w-lg w-full p-8 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">上传书籍</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="关闭"
            aria-label="关闭对话框"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${isDragging ? 'border-gray-400 bg-gray-50' : 'border-gray-300 hover:border-gray-400'}
            ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('dialogFileInput')?.click()}
        >
          <input
            type="file"
            id="dialogFileInput"
            className="hidden"
            accept=".pdf,.epub,.txt"
            onChange={handleFileSelect}
            aria-label="选择要上传的文件"
          />
          <div className="space-y-3">
            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">
              {uploading ? '正在上传...' : '点击或拖拽电子书到此处上传'}
            </h3>
            <p className="text-sm text-gray-500">支持 PDF、EPUB、TXT 格式</p>
            {error && <p className="text-sm text-gray-600 mt-2 font-medium">{error}</p>}
          </div>
        </div>

        {/* 书籍类型选择 */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            书籍类型
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* 普通书籍选项 */}
            <label
              onClick={() => setBookType('normal')}
              className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all
                ${bookType === 'normal'
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'}`}
            >
              <svg
                className={`w-6 h-6 mb-2 transition-colors ${
                  bookType === 'normal' ? 'text-gray-900' : 'text-gray-400'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332-.477-4.5-1.253" />
              </svg>
              <div className="font-medium text-gray-900 text-sm">普通书籍</div>
              <div className="text-xs text-gray-500 mt-1">正常阅读</div>
            </label>

            {/* 例句库选项 */}
            <label
              onClick={() => setBookType('example_library')}
              className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all
                ${bookType === 'example_library'
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'}`}
            >
              <svg
                className={`w-6 h-6 mb-2 transition-colors ${
                  bookType === 'example_library'
                    ? 'text-gray-900 fill-current'
                    : 'text-gray-400'
                }`}
                fill={bookType === 'example_library' ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={bookType === 'example_library' ? 0 : 2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <div className="font-medium text-gray-900 text-sm">
                例句库
              </div>
              <div className="text-xs text-gray-500 mt-1">
                为生词提供例句
              </div>
            </label>
          </div>
        </div>


        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
