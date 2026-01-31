import { useState, useRef } from 'react';
import { importDict } from '../lib/api';

interface DictImportDialogProps {
  onClose: () => void;
  onImportComplete?: (dictName: string) => void;
}

export function DictImportDialog({ onClose, onImportComplete }: DictImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importPhase, setImportPhase] = useState<'uploading' | 'parsing' | 'done'>('uploading');
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setName(selectedFile.name.replace(/\.(mdx|zip)$/i, ''));
      setError('');
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('请选择 MDX 或 ZIP 文件');
      return;
    }

    setImporting(true);
    setImportPhase('uploading');
    setProgress(0);
    setError('');

    try {
      await importDict(file, name || undefined, (percent) => {
        const pct = Math.round(percent);
        setProgress(pct);
        if (pct >= 100) {
          setImportPhase('parsing');
        }
      });
      // Ensure it hits 100% on completion
      setProgress(100);
      setImportPhase('parsing');

      setTimeout(() => {
        setImporting(false);
        setImportPhase('done');
        onImportComplete?.(name || file.name.replace(/\.(mdx|zip)$/i, ''));
        onClose();
      }, 500);
    } catch (error: any) {
      setError(error.message || '导入失败');
      setImporting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">导入词典</h2>
          <button
            onClick={onClose}
            disabled={importing}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择文件
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".mdx,.zip"
              onChange={handleFileChange}
              className="w-full border rounded p-2"
              disabled={importing}
            />
            <p className="text-xs text-gray-500 mt-1">
              支持 MDX 或 ZIP 格式的词典文件
            </p>
          </div>

          {file && (
            <div className="bg-gray-50 rounded p-3">
              <div className="text-sm">
                <div><strong>文件名:</strong> {file.name}</div>
                <div><strong>大小:</strong> {formatSize(file.size)}</div>
              </div>
            </div>
          )}

          {file && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                词典名称（可选）
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded p-2"
                placeholder={file.name.replace(/\.(mdx|zip)$/i, '')}
                disabled={importing}
              />
            </div>
          )}

          {importing && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-blue-600">
                  {importPhase === 'parsing' ? '正在解析词典...' : '正在上传文件...'}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded overflow-hidden">
                <div
                  className={`h-2 rounded transition-all duration-300 ${
                    importPhase === 'parsing' 
                      ? 'bg-blue-500 w-full animate-pulse' 
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {importPhase === 'parsing' && (
                <p className="text-xs text-gray-500 mt-2 text-center animate-pulse">
                  正在建立索引，大文件可能需要几分钟，请勿关闭...
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="flex-1 bg-blue-500 text-white py-2 rounded disabled:bg-gray-300"
            >
              {importing ? '导入中...' : '开始导入'}
            </button>
            <button
              onClick={onClose}
              disabled={importing}
              className="flex-1 border py-2 rounded disabled:border-gray-300"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
