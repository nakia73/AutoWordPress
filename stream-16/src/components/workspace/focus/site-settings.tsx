'use client';

import { useState } from 'react';
import { Save, RotateCcw, Globe, Layout, Link2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useSiteStore } from '@/lib/stores';

interface SettingItem {
  key: string;
  label: string;
  value: string;
  changed?: boolean;
}

type SettingsState = {
  [key: string]: SettingItem[];
};

const mockSettings: SettingsState = {
  general: [
    { key: 'site_title', label: 'サイトタイトル', value: 'My Blog' },
    { key: 'tagline', label: 'キャッチフレーズ', value: 'Just another WordPress site' },
    { key: 'admin_email', label: '管理者メール', value: 'admin@example.com' },
    { key: 'timezone', label: 'タイムゾーン', value: 'Asia/Tokyo' },
  ],
  reading: [
    { key: 'posts_per_page', label: '1ページの表示件数', value: '10' },
    { key: 'show_on_front', label: 'ホームページの表示', value: '最新の投稿' },
    { key: 'rss_items', label: 'RSSフィード件数', value: '10' },
  ],
  permalink: [
    { key: 'structure', label: 'パーマリンク構造', value: '/%postname%/' },
    { key: 'category_base', label: 'カテゴリベース', value: 'category' },
    { key: 'tag_base', label: 'タグベース', value: 'tag' },
  ],
};

const settingCategories = [
  { id: 'general', label: '一般設定', icon: Globe },
  { id: 'reading', label: '表示設定', icon: Layout },
  { id: 'permalink', label: 'パーマリンク', icon: Link2 },
];

export function SiteSettings() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [settings, setSettings] = useState(mockSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const { getCurrentSite } = useSiteStore();
  const currentSite = getCurrentSite();

  const handleSettingChange = (category: string, key: string, newValue: string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: (prev[category] || []).map((item) =>
        item.key === key ? { ...item, value: newValue, changed: true } : item
      ),
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('設定を保存:', settings);
    setHasChanges(false);
    // 変更フラグをリセット
    setSettings((prev) => {
      const newSettings: SettingsState = {};
      Object.keys(prev).forEach((cat) => {
        newSettings[cat] = prev[cat].map(
          (item) => ({ ...item, changed: false })
        );
      });
      return newSettings;
    });
  };

  const handleReset = () => {
    setSettings(mockSettings);
    setHasChanges(false);
  };

  const currentSettings = settings[activeCategory] || [];

  return (
    <div className="h-full flex">
      {/* カテゴリサイドバー */}
      <div className="w-56 border-r border-border bg-muted/20 p-4">
        <div className="space-y-1">
          {settingCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
                onClick={() => setActiveCategory(cat.id)}
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </Button>
            );
          })}
        </div>

        <Separator className="my-4" />

        {/* サイト情報 */}
        <div className="text-sm text-muted-foreground space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>WordPress 6.5</span>
          </div>
          <p className="truncate">{currentSite?.url}</p>
        </div>
      </div>

      {/* 設定コンテンツ */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {settingCategories.find((c) => c.id === activeCategory)?.label}
                {hasChanges && (
                  <Badge variant="outline" className="text-amber-500 border-amber-500">
                    未保存
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                サイトの{settingCategories.find((c) => c.id === activeCategory)?.label}を管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentSettings.map((setting) => (
                <div key={setting.key} className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    {setting.label}
                    {setting.changed && (
                      <span className="text-xs text-amber-500">変更あり</span>
                    )}
                  </label>
                  <Input
                    value={setting.value}
                    onChange={(e) =>
                      handleSettingChange(activeCategory, setting.key, e.target.value)
                    }
                    className={setting.changed ? 'border-amber-500' : ''}
                  />
                </div>
              ))}

              <Separator className="my-6" />

              {/* アクションボタン */}
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={!hasChanges}>
                  <Save className="h-4 w-4 mr-2" />
                  変更を保存
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  リセット
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
