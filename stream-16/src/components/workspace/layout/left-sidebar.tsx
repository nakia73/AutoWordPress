'use client';

import { ChatPanel } from '../chat/chat-panel';
import { Separator } from '@/components/ui/separator';

export function LeftSidebar() {
  return (
    <aside className="w-[360px] border-r border-sidebar-border bg-sidebar flex flex-col h-full">
      {/* Site Info (Compact) */}
      <div className="p-3 border-b border-sidebar-border">
        <p className="text-xs text-muted-foreground">現在のサイト</p>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col min-h-0">
        <ChatPanel />
      </div>

      {/* Task History (Collapsed) */}
      <div className="border-t border-sidebar-border p-3">
        <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors">
          タスク履歴 →
        </button>
      </div>
    </aside>
  );
}
