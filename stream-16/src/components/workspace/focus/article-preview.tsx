'use client';

import { Calendar, Tag, FolderOpen, Image } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { mockArticles, mockArticleAPI } from '@/lib/mocks';
import { useEffect, useState } from 'react';
import type { MockArticle } from '@/lib/mocks';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ArticlePreviewProps {
  articleId?: string;
}

export function ArticlePreview({ articleId }: ArticlePreviewProps) {
  const [article, setArticle] = useState<MockArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      setLoading(true);
      if (articleId) {
        const data = await mockArticleAPI.getArticle(articleId);
        setArticle(data);
      } else {
        setArticle(null);
      }
      setLoading(false);
    };
    loadArticle();
  }, [articleId]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">記事が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* メタ情報カード */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              {/* ステータス */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">ステータス:</span>
                <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                  {article.status === 'published' ? '公開済み' : article.status === 'draft' ? '下書き' : '保留中'}
                </Badge>
              </div>

              {/* 作成日 */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date(article.createdAt).toLocaleDateString('ja-JP')}
                </span>
              </div>

              {/* カテゴリ */}
              <div className="flex items-center gap-2 flex-wrap">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                {article.categories.map((cat) => (
                  <Badge key={cat} variant="outline" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>

              {/* タグ */}
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* アイキャッチ画像 */}
            {article.featuredImage && (
              <>
                <Separator className="my-4" />
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">アイキャッチ画像</span>
                </div>
                <div className="mt-2 rounded-lg overflow-hidden bg-muted aspect-video flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">
                    {article.featuredImage}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 記事タイトル */}
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {article.title}
        </h1>

        {/* 抜粋 */}
        <p className="text-lg text-muted-foreground mb-6 italic">
          {article.excerpt}
        </p>

        <Separator className="mb-6" />

        {/* 記事本文（Markdown） */}
        <article className="prose prose-invert prose-gold max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
