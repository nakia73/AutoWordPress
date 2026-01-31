'use client';

import { useFocusStore } from '@/lib/stores';
import { WelcomeView } from '../focus/welcome-view';
import { ArticlePreview } from '../focus/article-preview';
import { ArticleListTable } from '../focus/article-list-table';
import { SitePreview } from '../focus/site-preview';
import { SiteSettings } from '../focus/site-settings';
import { ThemePreview } from '../focus/theme-preview';
import { PluginList } from '../focus/plugin-list';

export function ContentDisplay() {
  const { current } = useFocusStore();

  const renderContent = () => {
    switch (current.type) {
      case 'article':
        return <ArticlePreview articleId={current.id} />;
      case 'article-list':
        return <ArticleListTable />;
      case 'site-preview':
        return <SitePreview />;
      case 'site-settings':
        return <SiteSettings />;
      case 'theme':
        return <ThemePreview />;
      case 'plugin-list':
        return <PluginList />;
      case 'none':
      default:
        return <WelcomeView />;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      {renderContent()}
    </div>
  );
}
