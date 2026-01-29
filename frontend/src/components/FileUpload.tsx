"use client";

import { useState } from 'react';
import { uploadBook } from '../lib/api';

export default function FileUpload({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const fileName = file.name.toLowerCase();
      const extension = fileName.split('.').pop();
      const validExtensions = ['pdf', 'epub', 'txt'];

      if (!validExtensions.includes(extension || '')) {
        throw new Error('仅支持 PDF、EPUB 和 TXT 格式');
      }

      await uploadBook(file, { book_type: 'normal' });
      onUploadSuccess();
      alert('上传成功！后台正在解析文档...');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input
        type="file"
        id="fileInput"
        className="hidden"
        accept=".pdf,.epub,.txt,application/pdf,application/epub+zip,text/plain"
        onChange={handleFileSelect}
      />
      <div className="space-y-2">
        <div className="text-4xl">📄</div>
        <h3 className="text-lg font-medium text-gray-900">
          {uploading ? '正在上传...' : '点击或拖拽电子书到此处上传'}
        </h3>
        <p className="text-sm text-gray-500">支持 PDF、EPUB、TXT 格式</p>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}
