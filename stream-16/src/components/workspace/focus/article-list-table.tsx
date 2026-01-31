'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, MoreHorizontal, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockArticles, mockArticleAPI, type MockArticle } from '@/lib/mocks';
import { useFocusStore } from '@/lib/stores';
import { cn } from '@/lib/utils';

type FilterStatus = 'all' | 'published' | 'draft' | 'pending';

const filterTabs: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'published', label: '公開済み' },
  { value: 'draft', label: '下書き' },
  { value: 'pending', label: '保留中' },
];

export function ArticleListTable() {
  const [articles, setArticles] = useState<MockArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { setFocus } = useFocusStore();

  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      const data = await mockArticleAPI.getArticles();
      setArticles(data);
      setLoading(false);
    };
    loadArticles();
  }, []);

  // フィルタリング
  const filteredArticles = articles.filter((article) => {
    const matchesFilter = filter === 'all' || article.status === filter;
    const matchesSearch =
      searchQuery === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // 選択切り替え
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // 全選択切り替え
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredArticles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredArticles.map((a) => a.id)));
    }
  };

  // 記事をクリックしてフォーカス
  const handleArticleClick = (article: MockArticle) => {
    setFocus({
      type: 'article',
      id: article.id,
      metadata: { title: article.title },
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex gap-4 mb-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* ツールバー */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-4 mb-4">
          {/* 検索 */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="記事を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* フィルタータブ */}
        <div className="flex gap-1">
          {filterTabs.map((tab) => (
            <Button
              key={tab.value}
              variant={filter === tab.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter(tab.value)}
              className={cn(
                filter === tab.value && 'bg-primary text-primary-foreground'
              )}
            >
              {tab.label}
              {tab.value === 'all' && (
                <Badge variant="secondary" className="ml-2">
                  {articles.length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* テーブル */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-muted/50 backdrop-blur">
            <tr className="border-b border-border">
              <th className="p-3 text-left w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filteredArticles.length && filteredArticles.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-border"
                />
              </th>
              <th className="p-3 text-left font-medium text-muted-foreground">
                タイトル
              </th>
              <th className="p-3 text-left font-medium text-muted-foreground w-28">
                ステータス
              </th>
              <th className="p-3 text-left font-medium text-muted-foreground w-32">
                作成日
              </th>
              <th className="p-3 text-left font-medium text-muted-foreground w-16">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.map((article) => (
              <tr
                key={article.id}
                className={cn(
                  'border-b border-border hover:bg-muted/30 cursor-pointer transition-colors',
                  selectedIds.has(article.id) && 'bg-primary/5'
                )}
                onClick={() => handleArticleClick(article)}
              >
                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(article.id)}
                    onChange={() => toggleSelection(article.id)}
                    className="rounded border-border"
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{article.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-md">
                        {article.excerpt}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <Badge
                    variant={
                      article.status === 'published'
                        ? 'default'
                        : article.status === 'draft'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {article.status === 'published'
                      ? '公開済み'
                      : article.status === 'draft'
                      ? '下書き'
                      : '保留中'}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(article.createdAt).toLocaleDateString('ja-JP')}
                  </div>
                </td>
                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleArticleClick(article)}>
                        編集
                      </DropdownMenuItem>
                      <DropdownMenuItem>プレビュー</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredArticles.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            記事が見つかりません
          </div>
        )}
      </div>

      {/* 選択情報 */}
      {selectedIds.size > 0 && (
        <div className="p-3 border-t border-border bg-muted/30">
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} 件選択中
          </span>
        </div>
      )}
    </div>
  );
}
