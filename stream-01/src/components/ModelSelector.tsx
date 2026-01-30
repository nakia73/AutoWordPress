'use client';

/**
 * ModelSelector Component
 * ======================
 * LLMモデル選択コンポーネント
 *
 * 責務:
 * - モデル選択UIの提供
 * - Gemini / Claude Batch / Claude Sync の切り替え
 *
 * 使用例:
 * ```tsx
 * <ModelSelector value={model} onChange={setModel} />
 * ```
 */

export type LLMModelOption = {
  id: string;
  name: string;
  provider: 'google' | 'anthropic';
  apiMode?: 'sync' | 'batch';
  description: string;
  costIndicator: 'low' | 'medium' | 'high';
  speedIndicator: 'fast' | 'medium' | 'slow';
};

export const LLM_MODEL_OPTIONS: LLMModelOption[] = [
  // Google Gemini
  {
    id: 'gemini-3-flash',
    name: 'Gemini 3 Flash',
    provider: 'google',
    description: '高速・低コスト（推奨）',
    costIndicator: 'low',
    speedIndicator: 'fast',
  },
  {
    id: 'gemini-3-pro',
    name: 'Gemini 3 Pro',
    provider: 'google',
    description: '高品質',
    costIndicator: 'medium',
    speedIndicator: 'medium',
  },
  // Anthropic Claude - Batch API (50% OFF)
  {
    id: 'claude-haiku-4.5-batch',
    name: 'Claude Haiku 4.5 (Batch)',
    provider: 'anthropic',
    apiMode: 'batch',
    description: '50%コスト削減・非同期',
    costIndicator: 'low',
    speedIndicator: 'slow',
  },
  {
    id: 'claude-sonnet-4.5-batch',
    name: 'Claude Sonnet 4.5 (Batch)',
    provider: 'anthropic',
    apiMode: 'batch',
    description: '高品質・50%コスト削減',
    costIndicator: 'medium',
    speedIndicator: 'slow',
  },
  // Anthropic Claude - Sync API
  {
    id: 'claude-haiku-4.5-sync',
    name: 'Claude Haiku 4.5 (Sync)',
    provider: 'anthropic',
    apiMode: 'sync',
    description: '即座応答・標準価格',
    costIndicator: 'medium',
    speedIndicator: 'fast',
  },
  {
    id: 'claude-sonnet-4.5-sync',
    name: 'Claude Sonnet 4.5 (Sync)',
    provider: 'anthropic',
    apiMode: 'sync',
    description: '高品質・即座応答',
    costIndicator: 'high',
    speedIndicator: 'medium',
  },
];

export type ModelSelectorProps = {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
  className?: string;
};

function getCostBadge(indicator: 'low' | 'medium' | 'high') {
  switch (indicator) {
    case 'low':
      return <span className="text-xs px-1.5 py-0.5 rounded bg-green-900/50 text-green-400">$</span>;
    case 'medium':
      return <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-900/50 text-yellow-400">$$</span>;
    case 'high':
      return <span className="text-xs px-1.5 py-0.5 rounded bg-red-900/50 text-red-400">$$$</span>;
  }
}

function getSpeedBadge(indicator: 'fast' | 'medium' | 'slow') {
  switch (indicator) {
    case 'fast':
      return <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-400">Fast</span>;
    case 'medium':
      return <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">Med</span>;
    case 'slow':
      return <span className="text-xs px-1.5 py-0.5 rounded bg-orange-900/50 text-orange-400">Async</span>;
  }
}

function getProviderIcon(provider: 'google' | 'anthropic') {
  if (provider === 'google') {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="#D97757"/>
    </svg>
  );
}

export function ModelSelector({ value, onChange, disabled, className }: ModelSelectorProps) {
  const selectedModel = LLM_MODEL_OPTIONS.find((m) => m.id === value) || LLM_MODEL_OPTIONS[0];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        LLMモデル
      </label>
      <div className="grid grid-cols-1 gap-2">
        {LLM_MODEL_OPTIONS.map((model) => (
          <button
            key={model.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(model.id)}
            className={`w-full p-3 rounded-lg border text-left transition-colors ${
              value === model.id
                ? 'border-blue-500 bg-blue-900/30'
                : 'border-gray-600 hover:border-gray-500'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getProviderIcon(model.provider)}
                <span className="font-medium text-sm">{model.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {getCostBadge(model.costIndicator)}
                {getSpeedBadge(model.speedIndicator)}
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1 ml-6">{model.description}</div>
          </button>
        ))}
      </div>
      {selectedModel.apiMode === 'batch' && (
        <p className="text-xs text-orange-400 mt-2">
          Batch APIは処理に数分〜1時間かかる場合があります
        </p>
      )}
    </div>
  );
}

/**
 * モデルIDからLLMClient設定に変換
 */
export function parseModelId(modelId: string): {
  model: string;
  provider: 'google' | 'anthropic';
  apiMode?: 'sync' | 'batch';
} {
  const option = LLM_MODEL_OPTIONS.find((m) => m.id === modelId);
  if (!option) {
    return { model: 'gemini-3-flash', provider: 'google' };
  }

  // モデルIDからベースモデル名を抽出
  let baseModel = option.id;
  if (option.apiMode) {
    baseModel = option.id.replace('-batch', '').replace('-sync', '');
  }

  return {
    model: baseModel,
    provider: option.provider,
    apiMode: option.apiMode,
  };
}
