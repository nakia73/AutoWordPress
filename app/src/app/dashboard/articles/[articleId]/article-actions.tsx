'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Article = {
  id: string;
  status: string;
  wpPostId: number | null;
  cluster: {
    product: {
      siteId: string;
      site: {
        slug: string;
      };
    };
  };
};

export function ArticleActions({ article }: { article: Article }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<string | null>(null);

  const handleAction = async (actionType: 'generate' | 'publish' | 'unpublish') => {
    setIsLoading(true);
    setAction(actionType);

    try {
      const response = await fetch(`/api/articles/${article.id}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: actionType }),
      });

      if (!response.ok) {
        throw new Error('Action failed');
      }

      router.refresh();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {article.status === 'draft' && (
        <Button
          onClick={() => handleAction('generate')}
          loading={isLoading && action === 'generate'}
        >
          Generate Content
        </Button>
      )}

      {article.status === 'review' && (
        <Button
          onClick={() => handleAction('publish')}
          loading={isLoading && action === 'publish'}
        >
          Publish to WordPress
        </Button>
      )}

      {article.status === 'published' && (
        <>
          <a
            href={`https://${article.cluster.product.site.slug}.argonote.app/?p=${article.wpPostId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline">View on Site</Button>
          </a>
          <Button
            variant="outline"
            onClick={() => handleAction('unpublish')}
            loading={isLoading && action === 'unpublish'}
          >
            Unpublish
          </Button>
        </>
      )}

      {article.status === 'failed' && (
        <Button
          onClick={() => handleAction('generate')}
          loading={isLoading && action === 'generate'}
        >
          Retry Generation
        </Button>
      )}
    </div>
  );
}
