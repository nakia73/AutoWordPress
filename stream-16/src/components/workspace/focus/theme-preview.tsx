'use client';

import { useState } from 'react';
import { Check, Palette, ExternalLink, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Theme {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  active: boolean;
  screenshot: string;
}

const mockThemes: Theme[] = [
  {
    id: 'theme-1',
    name: 'Twenty Twenty-Four',
    version: '1.2',
    author: 'WordPress Team',
    description: 'WordPress 6.4のデフォルトテーマ。ブロックエディタに最適化された美しいデザイン。',
    active: true,
    screenshot: 'gradient-blue',
  },
  {
    id: 'theme-2',
    name: 'Flavor',
    version: '2.1',
    author: 'Theme Studio',
    description: 'ミニマルで高速なブログテーマ。SEOに最適化されています。',
    active: false,
    screenshot: 'gradient-purple',
  },
  {
    id: 'theme-3',
    name: 'Developer Pro',
    version: '3.0',
    author: 'Dev Themes',
    description: '技術ブログに最適。シンタックスハイライト対応。',
    active: false,
    screenshot: 'gradient-green',
  },
];

const gradients = {
  'gradient-blue': 'from-blue-400 to-blue-600',
  'gradient-purple': 'from-purple-400 to-pink-500',
  'gradient-green': 'from-green-400 to-emerald-600',
};

export function ThemePreview() {
  const [themes, setThemes] = useState(mockThemes);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(
    mockThemes.find((t) => t.active) || null
  );

  const handleActivate = (themeId: string) => {
    setThemes((prev) =>
      prev.map((t) => ({
        ...t,
        active: t.id === themeId,
      }))
    );
    setSelectedTheme(themes.find((t) => t.id === themeId) || null);
  };

  return (
    <div className="h-full flex">
      {/* テーマ一覧 */}
      <div className="w-80 border-r border-border overflow-auto p-4 space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          インストール済みテーマ
        </h3>
        {themes.map((theme) => (
          <Card
            key={theme.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              selectedTheme?.id === theme.id && 'ring-2 ring-primary',
              theme.active && 'bg-primary/5'
            )}
            onClick={() => setSelectedTheme(theme)}
          >
            {/* テーマスクリーンショット */}
            <div
              className={cn(
                'h-32 bg-gradient-to-br rounded-t-lg',
                gradients[theme.screenshot as keyof typeof gradients]
              )}
            />
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{theme.name}</span>
                {theme.active && (
                  <Badge variant="default" className="text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    有効
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                v{theme.version} by {theme.author}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* テーマ詳細 */}
      <div className="flex-1 overflow-auto">
        {selectedTheme ? (
          <div className="p-6">
            {/* ヘッダー */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-2xl font-bold">{selectedTheme.name}</h2>
                {selectedTheme.active && (
                  <Badge>現在のテーマ</Badge>
                )}
              </div>
              <p className="text-muted-foreground">{selectedTheme.description}</p>
            </div>

            {/* プレビュー */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">テーマプレビュー</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    'aspect-video bg-gradient-to-br rounded-lg flex items-center justify-center',
                    gradients[selectedTheme.screenshot as keyof typeof gradients]
                  )}
                >
                  <div className="text-center text-white">
                    <div className="text-4xl font-bold mb-2">{selectedTheme.name}</div>
                    <div className="opacity-80">WordPress Theme Preview</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* テーマ情報 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">テーマ情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">バージョン:</span>
                    <span className="ml-2">{selectedTheme.version}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">作成者:</span>
                    <span className="ml-2">{selectedTheme.author}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* アクション */}
            <div className="flex gap-2">
              {!selectedTheme.active && (
                <Button onClick={() => handleActivate(selectedTheme.id)}>
                  <Check className="h-4 w-4 mr-2" />
                  有効化
                </Button>
              )}
              <Button variant="outline">
                <Palette className="h-4 w-4 mr-2" />
                カスタマイズ
              </Button>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                テーマページを開く
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            テーマを選択してください
          </div>
        )}
      </div>
    </div>
  );
}
