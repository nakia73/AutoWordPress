'use client';

import { useState } from 'react';
import { generateArticleAction, type GenerationResult } from './actions';
import { ModelSelector, parseModelId, LLM_MODEL_OPTIONS } from '@/components/ModelSelector';
import type { LogEntry } from '@/lib/ai/pipeline-logger';

type ArticleType = 'article' | 'faq' | 'glossary';
type Language = 'ja' | 'en';
type InputMode = 'text' | 'site_url' | 'hybrid';

// ログエントリのレベルに応じた色を返す
function getLogLevelColor(level: LogEntry['level']): string {
  switch (level) {
    case 'success': return 'text-green-400';
    case 'error': return 'text-red-400';
    case 'warning': return 'text-yellow-400';
    case 'debug': return 'text-gray-500';
    default: return 'text-blue-400';
  }
}

function getLogLevelIcon(level: LogEntry['level']): string {
  switch (level) {
    case 'success': return '✓';
    case 'error': return '✗';
    case 'warning': return '⚠';
    case 'debug': return '…';
    default: return '→';
  }
}

export default function ArticleGenDevPage() {
  // Input mode
  const [inputMode, setInputMode] = useState<InputMode>('text');

  // Common fields
  const [language, setLanguage] = useState<Language>('ja');
  const [articleType, setArticleType] = useState<ArticleType>('article');
  const [includeImages, setIncludeImages] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(LLM_MODEL_OPTIONS[0].id);

  // Text mode fields
  const [keyword, setKeyword] = useState('');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  // URL mode fields
  const [siteUrl, setSiteUrl] = useState('');

  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'metadata' | 'logs'>('preview');
  const [showDebugLogs, setShowDebugLogs] = useState(false);

  const validateInput = (): string | null => {
    switch (inputMode) {
      case 'text':
        if (!keyword.trim()) return 'キーワードを入力してください';
        break;
      case 'site_url':
        if (!siteUrl.trim()) return 'サイトURLを入力してください';
        if (!siteUrl.startsWith('http')) return '有効なURLを入力してください';
        break;
      case 'hybrid':
        if (!siteUrl.trim() && !keyword.trim()) {
          return 'URL またはキーワードを少なくとも1つ入力してください';
        }
        break;
    }
    return null;
  };

  const handleGenerate = async () => {
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      // Parse model selection
      const modelConfig = parseModelId(selectedModel);

      const generationResult = await generateArticleAction({
        inputMode,
        // Text mode
        targetKeyword: keyword || undefined,
        productName: productName || undefined,
        productDescription: productDescription || undefined,
        additionalContext: additionalContext || undefined,
        // URL mode
        siteUrl: siteUrl || undefined,
        // Common
        articleType,
        language,
        includeImages,
        // Model selection
        llmModel: {
          modelId: modelConfig.model,
          provider: modelConfig.provider,
          apiMode: modelConfig.apiMode,
        },
      });

      if (generationResult.success) {
        setResult(generationResult);
        setActiveTab('preview');
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
    const thumbnailHtml = result.thumbnailBase64
      ? `<figure class="thumbnail"><img src="${result.thumbnailBase64}" alt="${result.article.title}" /></figure>\n`
      : '';
    const htmlContent = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${result.article.meta_description}">
  <title>${result.article.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 2rem; color: #333; background: #fff; }
    h1 { font-size: 2rem; margin-bottom: 1rem; color: #1a1a1a; }
    h2 { font-size: 1.5rem; margin-top: 2.5rem; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
    h3 { font-size: 1.25rem; margin-top: 1.5rem; }
    p { margin-bottom: 1rem; }
    figure { margin: 2rem 0; text-align: center; }
    figure img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    figure.thumbnail { margin-bottom: 2rem; }
    ul, ol { padding-left: 1.5rem; margin: 1rem 0; }
    li { margin-bottom: 0.5rem; }
  </style>
</head>
<body>
${thumbnailHtml}${result.article.content}
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
      {/* Custom styles for article preview */}
      <style jsx global>{`
        .article-preview figure {
          margin: 1.5rem 0;
          text-align: center;
        }
        .article-preview figure img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .article-preview h1 {
          font-size: 1.75rem;
          font-weight: bold;
          margin-bottom: 1rem;
          color: #fff;
          line-height: 1.3;
        }
        .article-preview h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          color: #e5e7eb;
          border-bottom: 1px solid #374151;
          padding-bottom: 0.5rem;
        }
        .article-preview h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          color: #d1d5db;
        }
        .article-preview p {
          margin-bottom: 1rem;
          line-height: 1.75;
          color: #9ca3af;
        }
        .article-preview ul, .article-preview ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        .article-preview li {
          margin-bottom: 0.5rem;
          color: #9ca3af;
        }
        .article-preview strong {
          color: #f3f4f6;
        }
      `}</style>
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Argo Note - Article Generator (Dev)
          </h1>
          <p className="text-gray-400 mt-2">
            スタンドアロン記事生成テスト用UI - 4入力モード対応
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">入力</h2>

            {/* Input Mode Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                入力モード
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'text', label: 'テキスト入力', desc: '直接情報を入力' },
                  { value: 'site_url', label: 'サイトURL', desc: 'LPから自動抽出' },
                  { value: 'hybrid', label: 'ハイブリッド', desc: 'URL+テキスト組合せ' },
                ].map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => setInputMode(mode.value as InputMode)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      inputMode === mode.value
                        ? 'border-blue-500 bg-blue-900/30'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium text-sm">{mode.label}</div>
                    <div className="text-xs text-gray-400">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {/* Text Mode Fields */}
              {(inputMode === 'text' || inputMode === 'hybrid') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      ターゲットキーワード {inputMode === 'text' && '*'}
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
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Site URL Field */}
              {(inputMode === 'site_url' || inputMode === 'hybrid') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    サイトURL {inputMode === 'site_url' && '*'}
                  </label>
                  <input
                    type="url"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    placeholder="https://example.com/product"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    製品/サービスのランディングページURL（Jina Readerで情報抽出）
                  </p>
                </div>
              )}


              {/* Additional Context (for hybrid) */}
              {inputMode === 'hybrid' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    追加コンテキスト
                  </label>
                  <textarea
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    placeholder="記事に含めたい追加情報やトーン指定など"
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Common Fields */}
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

              {/* LLM Model Selector */}
              <ModelSelector
                value={selectedModel}
                onChange={setSelectedModel}
                disabled={isGenerating}
              />

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
                  <button
                    onClick={() => setActiveTab('logs')}
                    className={`px-3 py-1 text-sm rounded ${activeTab === 'logs' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    Logs ({result.logs?.length || 0})
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
                  <div className="space-y-6">
                    {/* Thumbnail Image */}
                    {result.thumbnailBase64 && (
                      <div className="relative rounded-lg overflow-hidden shadow-lg">
                        <img
                          src={result.thumbnailBase64}
                          alt={result.article?.title || 'Article thumbnail'}
                          className="w-full h-auto object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          サムネイル画像
                        </div>
                      </div>
                    )}
                    {/* Article Content with Section Images */}
                    <div
                      className="article-preview"
                      dangerouslySetInnerHTML={{ __html: result.article?.content || '' }}
                    />
                  </div>
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

                {activeTab === 'logs' && result.logs && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-400">
                        {result.logs.length} entries
                      </div>
                      <label className="flex items-center text-sm text-gray-400">
                        <input
                          type="checkbox"
                          checked={showDebugLogs}
                          onChange={(e) => setShowDebugLogs(e.target.checked)}
                          className="mr-2"
                        />
                        Show debug logs
                      </label>
                    </div>
                    <div className="space-y-1 font-mono text-xs">
                      {result.logs
                        .filter(log => showDebugLogs || log.level !== 'debug')
                        .map((log, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded ${log.level === 'error' ? 'bg-red-900/30' : log.level === 'warning' ? 'bg-yellow-900/30' : 'bg-gray-800'}`}
                        >
                          <div className="flex items-start gap-2">
                            <span className={`${getLogLevelColor(log.level)} font-bold`}>
                              {getLogLevelIcon(log.level)}
                            </span>
                            <span className="text-gray-500 shrink-0">
                              {new Date(log.timestamp).toLocaleTimeString('ja-JP', { hour12: false })}
                            </span>
                            <span className="text-purple-400 shrink-0 font-semibold">
                              [{log.step}]
                            </span>
                            <span className="text-gray-200 flex-1">
                              {log.message}
                            </span>
                          </div>
                          {log.details && Object.keys(log.details).length > 0 && (
                            <div className="mt-1 ml-6 text-gray-400">
                              {Object.entries(log.details).map(([key, value]) => (
                                <div key={key} className="flex gap-2">
                                  <span className="text-gray-500">{key}:</span>
                                  <span className="text-cyan-400">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                  {(result.thumbnailBase64 ? 1 : 0) + (result.metadata.sectionImagesGenerated || 0)}
                </div>
                <div className="text-sm text-gray-400">
                  生成画像 {result.thumbnailBase64 && '(+サムネ)'}
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-cyan-400 capitalize">
                  {result.metadata.inputMode || 'text'}
                </div>
                <div className="text-sm text-gray-400">入力モード</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-lg font-bold text-yellow-400">
                  {result.metadata.llmModel || 'N/A'}
                </div>
                <div className="text-sm text-gray-400">
                  {result.metadata.llmProvider || 'N/A'} {result.metadata.llmApiMode ? `(${result.metadata.llmApiMode})` : ''}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
