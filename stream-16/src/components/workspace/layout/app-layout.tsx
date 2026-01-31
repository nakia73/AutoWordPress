'use client';

import { useEffect } from 'react';
import { Header } from './header';
import { LeftSidebar } from './left-sidebar';
import { MainArea } from './main-area';
import { StatusBar } from './status-bar';
import { useSiteStore } from '@/lib/stores';
import { mockSites } from '@/lib/mocks';
import { TooltipProvider } from '@/components/ui/tooltip';

export function AppLayout() {
  const { setSites, selectSite, sites } = useSiteStore();

  // 初期化: モックサイトをロード
  useEffect(() => {
    if (sites.length === 0) {
      setSites(mockSites);
      // 最初のアクティブなサイトを選択
      const activeSite = mockSites.find((s) => s.status === 'active');
      if (activeSite) {
        selectSite(activeSite.id);
      }
    }
  }, [sites.length, setSites, selectSite]);

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header - 64px */}
        <Header />

        {/* Main Content */}
        <div className="flex-1 flex min-h-0">
          {/* Left Sidebar - 360px */}
          <LeftSidebar />

          {/* Main Area - flex-1 */}
          <MainArea />
        </div>

        {/* Status Bar - 32px */}
        <StatusBar />
      </div>
    </TooltipProvider>
  );
}
