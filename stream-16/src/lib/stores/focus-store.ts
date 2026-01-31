import { create } from 'zustand';

export type FocusType =
  | 'none'
  | 'article'
  | 'article-list'
  | 'theme'
  | 'plugin-list'
  | 'site-settings'
  | 'site-preview';

export interface FocusTarget {
  type: FocusType;
  id?: string;
  title?: string;
  status?: 'draft' | 'published' | 'pending' | 'editing';
  metadata?: Record<string, unknown>;
}

interface FocusStore {
  current: FocusTarget;
  history: FocusTarget[];
  hasUnsavedChanges: boolean;
  setFocus: (target: FocusTarget) => void;
  clearFocus: () => void;
  goBack: () => void;
  setUnsavedChanges: (value: boolean) => void;
}

export const useFocusStore = create<FocusStore>((set, get) => ({
  current: { type: 'none' },
  history: [],
  hasUnsavedChanges: false,

  setFocus: (target) => {
    const { current, history } = get();
    // 現在のフォーカスを履歴に追加（noneは追加しない）
    const newHistory = current.type !== 'none'
      ? [...history, current].slice(-10) // 最大10件まで保持
      : history;

    set({
      current: target,
      history: newHistory,
      hasUnsavedChanges: false,
    });
  },

  clearFocus: () => {
    set({
      current: { type: 'none' },
      hasUnsavedChanges: false,
    });
  },

  goBack: () => {
    const { history } = get();
    if (history.length > 0) {
      const previous = history[history.length - 1];
      set({
        current: previous,
        history: history.slice(0, -1),
        hasUnsavedChanges: false,
      });
    } else {
      set({
        current: { type: 'none' },
        hasUnsavedChanges: false,
      });
    }
  },

  setUnsavedChanges: (value) => {
    set({ hasUnsavedChanges: value });
  },
}));

// フォーカスタイプに対応するラベルを取得
export function getFocusLabel(type: FocusType): string {
  const labels: Record<FocusType, string> = {
    'none': '',
    'article': '記事',
    'article-list': '投稿一覧',
    'theme': 'テーマ',
    'plugin-list': 'プラグイン一覧',
    'site-settings': 'サイト設定',
    'site-preview': 'サイトプレビュー',
  };
  return labels[type];
}
