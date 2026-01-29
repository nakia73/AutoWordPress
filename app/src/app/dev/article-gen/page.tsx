'use client';

import { useState } from 'react';
import { generateArticleAction, type GenerationResult } from './actions';

type ArticleType = 'article' | 'faq' | 'glossary';
type Language = 'ja' | 'en';

export default function ArticleGenDevPage() {
  const [keyword, setKeyword] = useState('');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [articleType, setArticleType] = useState<ArticleType>('article');
  const [language, setLanguage] = useState<Language>('ja');
  const [includeImages, setIncludeImages] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'metadata'>('preview');

  const handleGenerate = async () => {
    if (!keyword.trim()) {
      setError('キーワードを入力してください');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const generationResult = await generateArticleAction({
        targetKeyword: keyword,
        productName: productName || 'Generic Product',
        productDescription: productDescription || 'A product or service',
        articleType,
        language,
        includeImages,
      });

      if (generationResult.success) {
        setResult(generationResult);
      } else {
        setError(generationResult.error || '記事生成に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    if (!result?.article) return;
    const htmlContent = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${result.article.meta_description}">
  <title>${result.article.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; }
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    h2 { font-size: 1.5rem; margin-top: 2rem; }
    h3 { font-size: 1.25rem; margin-top: 1.5rem; }
  </style>
</head>
<body>
${result.article.content}
</body>
</html>`;
    const slug = result.article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    downloadFile(htmlContent, `${slug}.html`, 'text/html');
  };

  const handleDownloadJson = () => {
    if (!result?.metadata) return;
    const slug = result.metadata.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    downloadFile(JSON.stringify(result.metadata, null, 2), `${slug}.json`, 'application/json');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Argo Note - Article Generator (Dev)
          </h1>
          <p className="text-gray-400 mt-2">
            スタンドアロン記事生成テスト用UI
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">入力</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  ターゲットキーワード *
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="例: タスク管理ツール 比較"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  プロダクト名
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="例: TaskFlow"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  プロダクト説明
                </label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="例: チーム向けタスク管理SaaSツール"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    記事タイプ
                  </label>
                  <select
                    value={articleType}
                    onChange={(e) => setArticleType(e.target.value as ArticleType)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="article">Article (3000-4000字)</option>
                    <option value="faq">FAQ (1500-2500字)</option>
                    <option value="glossary">Glossary (1000-2000字)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    言語
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ja">日本語</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeImages"
                  checked={includeImages}
                  onChange={(e) => setIncludeImages(e.target.checked)}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="includeImages" className="ml-2 text-sm text-gray-300">
                  画像を生成する（時間がかかります）
                </label>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    生成中...
                  </span>
                ) : (
                  '記事を生成'
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200">
                {error}
              </div>
            )}
          </div>

          {/* Output Panel */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">出力</h2>
              {result && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1 text-sm rounded ${activeTab === 'preview' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setActiveTab('html')}
                    className={`px-3 py-1 text-sm rounded ${activeTab === 'html' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    HTML
                  </button>
                  <button
                    onClick={() => setActiveTab('metadata')}
                    className={`px-3 py-1 text-sm rounded ${activeTab === 'metadata' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    Metadata
                  </button>
                </div>
              )}
            </div>

            {!result && !isGenerating && (
              <div className="h-96 flex items-center justify-center text-gray-500">
                記事を生成すると結果がここに表示されます
              </div>
            )}

            {isGenerating && (
              <div className="h-96 flex flex-col items-center justify-center text-gray-400">
                <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>記事を生成中...</p>
                <p className="text-sm text-gray-500 mt-2">これには数分かかることがあります</p>
              </div>
            )}

            {result && (
              <div className="h-[600px] overflow-auto">
                {activeTab === 'preview' && (
                  <div
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: result.article?.content || '' }}
                  />
                )}

                {activeTab === 'html' && (
                  <div className="relative">
                    <button
                      onClick={() => copyToClipboard(result.article?.content || '')}
                      className="absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-sm rounded"
                    >
                      Copy
                    </button>
                    <pre className="text-xs text-gray-300 overflow-auto p-4 bg-gray-900 rounded">
                      {result.article?.content}
                    </pre>
                  </div>
                )}

                {activeTab === 'metadata' && (
                  <div className="relative">
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(result.metadata, null, 2))}
                      className="absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-sm rounded"
                    >
                      Copy
                    </button>
                    <pre className="text-xs text-green-400 overflow-auto p-4 bg-gray-900 rounded">
                      {JSON.stringify(result.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats and Download */}
        {result && result.metadata && (
          <div className="mt-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">生成統計</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadHtml}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
                >
                  HTMLをダウンロード
                </button>
                <button
                  onClick={handleDownloadJson}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors"
                >
                  JSONをダウンロード
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">
                  {result.metadata.wordCount?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-gray-400">文字数</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">
                  {result.metadata.generationTimeMs ? `${(result.metadata.generationTimeMs / 1000).toFixed(1)}s` : '-'}
                </div>
                <div className="text-sm text-gray-400">生成時間</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">
                  {result.metadata.sources?.length || 0}
                </div>
                <div className="text-sm text-gray-400">参照ソース</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-400">
                  {result.metadata.sectionImagesGenerated || 0}
                </div>
                <div className="text-sm text-gray-400">生成画像</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
