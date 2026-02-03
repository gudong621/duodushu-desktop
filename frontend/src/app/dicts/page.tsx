"use client";

import Link from 'next/link';
import { DictManager } from '../../components/DictManager';

export default function DictsPage() {
  return (
    <main className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 4h11a1 1 0 011 1v14a1 1 0 01-1 1h-11a2 2 0 01-2-2V6a2 2 0 012-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 18H18" />
                <path fill="currentColor" stroke="none" d="M13.5 15h-1.2l-.3-1.2h-2l-.3 1.2H8.5l2-6h1.5l1.5 6zm-1.8-2.4l-.7-2.6-.7 2.6h1.4z" />
              </svg>
              <h1 className="text-3xl font-bold text-gray-900">词典管理</h1>
            </div>
            <p className="mt-2 text-gray-500">导入和管理 MDX 格式的词典</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="w-10 h-10 inline-grid place-items-center text-gray-500 hover:text-gray-900 transition-colors hover:bg-gray-100 rounded-full shrink-0"
              title="返回书架"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </Link>
            <Link
              href="/vocabulary"
              className="w-10 h-10 inline-grid place-items-center text-gray-500 hover:text-gray-900 transition-colors hover:bg-gray-100 rounded-full shrink-0"
              title="生词本"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </Link>
          </div>
        </header>

        <section>
          <DictManager />
        </section>

        <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">使用说明</h2>
          <div className="space-y-4 text-gray-600 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📁 导入词典</h3>
              <ul className="space-y-1 ml-4">
                <li>• 支持 MDX 和 ZIP 格式的词典文件</li>
                <li>• 导入后会自动建立索引，大文件可能需要几分钟</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🔄 排序与优先级</h3>
              <ul className="space-y-1 ml-4">
                <li>• 拖拽导入词典可调整查词时的优先级顺序</li>
                <li>• 排序越靠前的词典，查询时优先级越高</li>
                <li>• 查询顺序：内置词典 → 导入词典 → AI（兜底）</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">⚙️ 管理词典</h3>
              <ul className="space-y-1 ml-4">
                <li>• 通过勾选框启用或禁用已导入的词典</li>
                <li>• 禁用的词典不会参与查询，但文件和索引会保留</li>
                <li>• 删除词典将从系统中移除相关文件和索引，此操作不可恢复</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
