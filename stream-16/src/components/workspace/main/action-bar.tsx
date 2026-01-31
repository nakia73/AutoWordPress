'use client';

import { Save, Eye, Globe, Trash2, Edit, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFocusStore } from '@/lib/stores';

export function ActionBar() {
  const { current, hasUnsavedChanges, setUnsavedChanges } = useFocusStore();

  // フォーカスなしの場合は表示しない
  if (current.type === 'none') {
    return null;
  }

  const handleSaveDraft = () => {
    console.log('下書き保存');
    setUnsavedChanges(false);
    // TODO: 実際の保存処理
  };

  const handlePreview = () => {
    console.log('プレビュー');
    // TODO: プレビュー表示
  };

  const handlePublish = () => {
    console.log('公開設定');
    // TODO: 公開設定ダイアログ
  };

  const renderActions = () => {
    switch (current.type) {
      case 'article':
        return (
          <>
            <Button variant="outline" size="sm" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              下書き保存
            </Button>
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              プレビュー
            </Button>
            <Button variant="default" size="sm" onClick={handlePublish}>
              <Globe className="h-4 w-4 mr-2" />
              公開設定
            </Button>
          </>
        );

      case 'article-list':
        return (
          <>
            <Button variant="outline" size="sm" disabled>
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Trash2 className="h-4 w-4 mr-2" />
              削除
            </Button>
            <Button variant="outline" size="sm" disabled>
              <MoreHorizontal className="h-4 w-4 mr-2" />
              ステータス変更
            </Button>
          </>
        );

      case 'site-preview':
        return (
          <>
            <Button variant="outline" size="sm">
              更新
            </Button>
            <Button variant="outline" size="sm">
              新規タブで開く
            </Button>
          </>
        );

      case 'theme':
        return (
          <>
            <Button variant="outline" size="sm">
              有効化
            </Button>
            <Button variant="outline" size="sm">
              カスタマイズ
            </Button>
          </>
        );

      default:
        return null;
    }
  };

  const actions = renderActions();
  if (!actions) return null;

  return (
    <div className="h-14 px-4 border-t border-border bg-muted/30 flex items-center justify-end gap-2">
      {actions}
    </div>
  );
}
