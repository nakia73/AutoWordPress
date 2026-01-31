'use client';

import { Wifi, WifiOff, Loader2, Bot } from 'lucide-react';
import { useSiteStore, useFocusStore, useChatStore, getFocusLabel } from '@/lib/stores';

export function StatusBar() {
  const { connectionStatus, getCurrentSite } = useSiteStore();
  const { current } = useFocusStore();
  const { isStreaming } = useChatStore();
  const currentSite = getCurrentSite();

  return (
    <footer className="h-8 border-t border-border bg-card flex items-center justify-between px-4 text-xs">
      {/* Left: Connection Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          {connectionStatus === 'connected' && (
            <>
              <Wifi className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400">接続: OK</span>
            </>
          )}
          {connectionStatus === 'checking' && (
            <>
              <Loader2 className="h-3.5 w-3.5 text-yellow-400 animate-spin" />
              <span className="text-yellow-400">確認中...</span>
            </>
          )}
          {connectionStatus === 'disconnected' && (
            <>
              <WifiOff className="h-3.5 w-3.5 text-red-400" />
              <span className="text-red-400">未接続</span>
            </>
          )}
        </div>

        {currentSite && (
          <span className="text-muted-foreground">
            {currentSite.name}
          </span>
        )}
      </div>

      {/* Center: Current Focus */}
      <div className="text-muted-foreground">
        {current.type !== 'none' && (
          <span>
            フォーカス: {getFocusLabel(current.type)}
            {current.title && ` - ${current.title}`}
          </span>
        )}
      </div>

      {/* Right: AI Status */}
      <div className="flex items-center gap-1.5">
        <Bot className="h-3.5 w-3.5" />
        {isStreaming ? (
          <span className="text-primary">AI: 処理中...</span>
        ) : (
          <span className="text-muted-foreground">AI: Ready</span>
        )}
      </div>
    </footer>
  );
}
