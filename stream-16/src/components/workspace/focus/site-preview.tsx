'use client';

import { useState } from 'react';
import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSiteStore } from '@/lib/stores';
import { cn } from '@/lib/utils';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const deviceSizes = {
  desktop: 'w-full',
  tablet: 'w-[768px]',
  mobile: 'w-[375px]',
};

export function SitePreview() {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);
  const { getCurrentSite } = useSiteStore();
  const currentSite = getCurrentSite();

  const siteUrl = currentSite?.url || 'https://wordpress.org';

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleOpenInNewTab = () => {
    window.open(siteUrl, '_blank');
  };

  return (
    <div className="h-full flex flex-col">
      {/* ツールバー */}
      <div className="h-12 px-4 border-b border-border bg-muted/30 flex items-center justify-between">
        {/* デバイス切り替え */}
        <div className="flex items-center gap-1">
          <Button
            variant={device === 'desktop' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setDevice('desktop')}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={device === 'tablet' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setDevice('tablet')}
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={device === 'mobile' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setDevice('mobile')}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>

        {/* URL表示 */}
        <div className="flex-1 mx-4">
          <div className="bg-background/50 rounded-md px-3 py-1.5 text-sm text-muted-foreground truncate max-w-md mx-auto">
            {siteUrl}
          </div>
        </div>

        {/* アクション */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenInNewTab}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* iframeエリア */}
      <div className="flex-1 overflow-auto bg-muted/20 p-4 flex justify-center">
        <div
          className={cn(
            'bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300',
            deviceSizes[device],
            device !== 'desktop' && 'mx-auto'
          )}
          style={{ height: device === 'mobile' ? '667px' : '100%' }}
        >
          {/* モック用のプレースホルダー（実際のiframeは本番環境で使用） */}
          <div className="h-full bg-white relative">
            {/* サイトヘッダーモック */}
            <div className="h-16 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center px-6">
              <div className="text-white font-bold text-xl">{currentSite?.name || 'My WordPress Site'}</div>
            </div>

            {/* ナビゲーションモック */}
            <div className="h-12 bg-gray-100 border-b flex items-center gap-6 px-6 text-sm text-gray-600">
              <span className="font-medium text-blue-600">ホーム</span>
              <span>ブログ</span>
              <span>お問い合わせ</span>
              <span>会社概要</span>
            </div>

            {/* メインコンテンツモック */}
            <div className="p-6">
              {/* ヒーロー */}
              <div className="aspect-[21/9] bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600 mb-2">ウェルカムバナー</div>
                  <div className="text-gray-500">Featured Image Area</div>
                </div>
              </div>

              {/* 記事カード */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <div className="aspect-video bg-gray-200" />
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
                      <div className="h-3 bg-gray-100 rounded mb-1" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* フッターモック */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-800 flex items-center justify-center text-gray-400 text-sm">
              © 2026 {currentSite?.name || 'My Site'}. All rights reserved.
            </div>

            {/* iframeマスク（実際はiframeを使用） */}
            <div className="absolute inset-0 bg-transparent pointer-events-none flex items-center justify-center">
              <div className="bg-black/5 backdrop-blur-sm px-4 py-2 rounded-lg text-sm text-gray-500">
                プレビューモード（モック表示）
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
