'use client';

import { Pin, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFocusStore, useSiteStore, getFocusLabel } from '@/lib/stores';

/**
 * フォーカスバー
 * 現在操作対象のオブジェクトを表示し、クイックアクションを提供
 *
 * 責務:
 * - フォーカス状態の表示（タイプ、名前、ステータス）
 * - WordPressへのリンク生成
 * - フォーカス解除ボタン
 *
 * 依存:
 * - focus-store: フォーカス状態（title, status等はstoreから取得）
 * - site-store: 現在のサイトURL
 */
export function FocusBar() {
  const { current, clearFocus, hasUnsavedChanges } = useFocusStore();
  const { getCurrentSite } = useSiteStore();
  const currentSite = getCurrentSite();

  // フォーカスなしの場合は表示しない
  if (current.type === 'none') {
    return null;
  }

  const focusLabel = getFocusLabel(current.type);

  // 対象名を取得（storeのtitleまたはmetadataから）
  const targetName = current.title || (current.metadata?.name as string) || '';

  // ステータスを取得（storeから）
  const getStatusBadge = () => {
    if (!current.status) return null;

    const statusConfig = {
      published: { label: '公開済み', variant: 'default' as const },
      draft: { label: '下書き', variant: 'secondary' as const },
      pending: { label: '保留中', variant: 'outline' as const },
    };

    const config = statusConfig[current.status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  // WordPressで確認URLを生成
  const getWordPressUrl = () => {
    const baseUrl = currentSite?.url || 'https://example.com';
    const adminUrl = `${baseUrl}/wp-admin`;

    switch (current.type) {
      case 'article':
        return current.id
          ? `${adminUrl}/post.php?post=${current.id}&action=edit`
          : `${adminUrl}/post-new.php`;
      case 'article-list':
        return `${adminUrl}/edit.php`;
      case 'site-settings':
        return `${adminUrl}/options-general.php`;
      case 'theme':
        return `${adminUrl}/themes.php`;
      case 'plugin-list':
        return `${adminUrl}/plugins.php`;
      case 'site-preview':
        return baseUrl;
      default:
        return adminUrl;
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('未保存の変更があります。閉じてもよろしいですか？');
      if (!confirmed) return;
    }
    clearFocus();
  };

  return (
    <div className="h-12 px-4 border-b border-border bg-muted/30 flex items-center justify-between">
      {/* 左側: フォーカス情報 */}
      <div className="flex items-center gap-3">
        <Pin className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">
          {focusLabel}
        </span>
        {targetName && (
          <>
            <span className="text-muted-foreground">:</span>
            <span className="text-sm font-semibold text-foreground truncate max-w-[300px]">
              {targetName}
            </span>
          </>
        )}
        {getStatusBadge()}
        {hasUnsavedChanges && (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            未保存
          </Badge>
        )}
      </div>

      {/* 右側: アクションボタン */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(getWordPressUrl(), '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          WPで確認
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
