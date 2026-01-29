import { useState, useEffect, useRef, useCallback } from 'react';
import { DictImportDialog } from './DictImportDialog';
import { fetchDicts, deleteDict, DictInfo } from '../lib/api';

export function DictManager() {
  const [dicts, setDicts] = useState<DictInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadDicts = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      setDicts(await fetchDicts());
    } catch (error) {
      console.error('Failed to load dicts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDicts();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadDicts]);

  const handleDelete = async (dictName: string) => {
    if (!confirm(`确定要删除词典 "${dictName}" 吗？`)) return;

    try {
      await deleteDict(dictName);
      // 重新加载词典列表
      await loadDicts();
    } catch (error) {
      alert('删除失败');
      console.error('Failed to delete dict:', error);
    }
  };

  const handleToggle = async (dictName: string, active: boolean) => {
    try {
      const response = await fetch(`/api/dicts/${dictName}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });

      if (response.ok) {
        await loadDicts();
      } else {
        alert('操作失败');
      }
    } catch {
      alert('操作失败');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <button
          onClick={() => setShowImportDialog(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          导入词典
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : (
        <div className="space-y-4">
          {dicts.map((dict) => (
            <div
              key={dict.name}
              className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{dict.name}</h3>
                      {dict.is_builtin && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          内置
                        </span>
                      )}
                      {dict.type === 'imported' && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          导入
                        </span>
                      )}
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <div>单词数：{dict.word_count.toLocaleString()}</div>
                      <div>大小：{formatSize(dict.size)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!dict.is_builtin && (
                      <>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dict.is_active}
                            onChange={(e) => handleToggle(dict.name, e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">启用</span>
                        </label>
                        <button
                          onClick={() => handleDelete(dict.name)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          删除
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {dicts.length === 0 && (
            <div className="text-center py-12 text-gray-400 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
              暂无词典，点击右上角&ldquo;导入词典&rdquo;添加您的第一个词典
            </div>
          )}
        </div>
      )}

      {showImportDialog && (
        <DictImportDialog
          onClose={() => setShowImportDialog(false)}
          onImportComplete={loadDicts}
        />
      )}
    </div>
  );
}
