'use client';

import { useState } from 'react';
import { Power, PowerOff, Trash2, RefreshCw, Search, MoreHorizontal, Shield, Zap, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  active: boolean;
  hasUpdate: boolean;
  newVersion?: string;
}

const mockPlugins: Plugin[] = [
  {
    id: 'plugin-1',
    name: 'Yoast SEO',
    description: 'SEO対策の定番プラグイン。メタ情報やサイトマップを自動管理。',
    version: '22.1',
    author: 'Yoast',
    active: true,
    hasUpdate: true,
    newVersion: '22.3',
  },
  {
    id: 'plugin-2',
    name: 'WP Super Cache',
    description: 'サイトを高速化するキャッシュプラグイン。',
    version: '1.9.4',
    author: 'Automattic',
    active: true,
    hasUpdate: false,
  },
  {
    id: 'plugin-3',
    name: 'Wordfence Security',
    description: 'ファイアウォール、マルウェアスキャン、ログインセキュリティ。',
    version: '7.11.4',
    author: 'Wordfence',
    active: true,
    hasUpdate: false,
  },
  {
    id: 'plugin-4',
    name: 'Contact Form 7',
    description: 'シンプルで柔軟なお問い合わせフォーム。',
    version: '5.9.3',
    author: 'Takayuki Miyoshi',
    active: false,
    hasUpdate: true,
    newVersion: '5.9.5',
  },
  {
    id: 'plugin-5',
    name: 'WooCommerce',
    description: 'フル機能のeコマースプラグイン。',
    version: '8.5.1',
    author: 'Automattic',
    active: false,
    hasUpdate: false,
  },
];

type FilterType = 'all' | 'active' | 'inactive' | 'update';

export function PluginList() {
  const [plugins, setPlugins] = useState(mockPlugins);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const togglePlugin = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const updatePlugin = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, version: p.newVersion || p.version, hasUpdate: false } : p
      )
    );
  };

  const filteredPlugins = plugins.filter((plugin) => {
    const matchesSearch =
      searchQuery === '' ||
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase());

    switch (filter) {
      case 'active':
        return matchesSearch && plugin.active;
      case 'inactive':
        return matchesSearch && !plugin.active;
      case 'update':
        return matchesSearch && plugin.hasUpdate;
      default:
        return matchesSearch;
    }
  });

  const counts = {
    all: plugins.length,
    active: plugins.filter((p) => p.active).length,
    inactive: plugins.filter((p) => !p.active).length,
    update: plugins.filter((p) => p.hasUpdate).length,
  };

  return (
    <div className="h-full flex flex-col">
      {/* ツールバー */}
      <div className="p-4 border-b border-border">
        {/* 検索 */}
        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="プラグインを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* フィルター */}
        <div className="flex gap-1">
          {[
            { key: 'all', label: 'すべて' },
            { key: 'active', label: '有効' },
            { key: 'inactive', label: '無効' },
            { key: 'update', label: '更新あり' },
          ].map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter(f.key as FilterType)}
            >
              {f.label}
              <Badge variant="secondary" className="ml-2">
                {counts[f.key as FilterType]}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* プラグイン一覧 */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-muted/50 backdrop-blur">
            <tr className="border-b border-border text-left text-sm">
              <th className="p-3 font-medium text-muted-foreground">プラグイン</th>
              <th className="p-3 font-medium text-muted-foreground w-24">ステータス</th>
              <th className="p-3 font-medium text-muted-foreground w-24">バージョン</th>
              <th className="p-3 font-medium text-muted-foreground w-16">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlugins.map((plugin) => (
              <tr
                key={plugin.id}
                className={cn(
                  'border-b border-border hover:bg-muted/30 transition-colors',
                  plugin.active && 'bg-primary/5'
                )}
              >
                <td className="p-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        plugin.active ? 'bg-primary/10' : 'bg-muted'
                      )}
                    >
                      <Package className={cn('h-5 w-5', plugin.active ? 'text-primary' : 'text-muted-foreground')} />
                    </div>
                    <div>
                      <div className="font-medium">{plugin.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {plugin.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        by {plugin.author}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <Badge variant={plugin.active ? 'default' : 'secondary'}>
                    {plugin.active ? '有効' : '無効'}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{plugin.version}</span>
                    {plugin.hasUpdate && (
                      <Badge variant="outline" className="text-xs text-amber-500 border-amber-500">
                        {plugin.newVersion}へ更新可
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => togglePlugin(plugin.id)}>
                        {plugin.active ? (
                          <>
                            <PowerOff className="h-4 w-4 mr-2" />
                            無効化
                          </>
                        ) : (
                          <>
                            <Power className="h-4 w-4 mr-2" />
                            有効化
                          </>
                        )}
                      </DropdownMenuItem>
                      {plugin.hasUpdate && (
                        <DropdownMenuItem onClick={() => updatePlugin(plugin.id)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          更新
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPlugins.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            プラグインが見つかりません
          </div>
        )}
      </div>
    </div>
  );
}
