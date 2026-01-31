'use client';

import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSiteStore } from '@/lib/stores';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  showDetails?: boolean;
}

export function ConnectionStatus({ showDetails = false }: ConnectionStatusProps) {
  const { connectionStatus, getCurrentSite, checkConnection } = useSiteStore();
  const currentSite = getCurrentSite();

  const statusConfig = {
    connected: {
      icon: Wifi,
      label: '接続中',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    disconnected: {
      icon: WifiOff,
      label: '未接続',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    checking: {
      icon: RefreshCw,
      label: '確認中',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  };

  const config = statusConfig[connectionStatus];
  const Icon = config.icon;

  const handleRefresh = () => {
    checkConnection();
  };

  if (!showDetails) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-md',
              config.bgColor
            )}
          >
            <Icon
              className={cn(
                'h-3.5 w-3.5',
                config.color,
                connectionStatus === 'checking' && 'animate-spin'
              )}
            />
            <span className={cn('text-xs font-medium', config.color)}>
              {config.label}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">{currentSite?.name || '未選択'}</p>
            <p className="text-muted-foreground">
              {currentSite?.url || 'サイトを選択してください'}
            </p>
            {currentSite?.wpVersion && (
              <p className="text-muted-foreground">
                WordPress {currentSite.wpVersion}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          config.bgColor
        )}
      >
        <Icon
          className={cn(
            'h-5 w-5',
            config.color,
            connectionStatus === 'checking' && 'animate-spin'
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">
            {currentSite?.name || 'サイト未選択'}
          </span>
          <Badge variant="outline" className={cn('text-xs', config.color)}>
            {config.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {currentSite?.url || 'サイトを選択してください'}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRefresh}
        disabled={connectionStatus === 'checking'}
        className="h-8 w-8"
      >
        <RefreshCw
          className={cn(
            'h-4 w-4',
            connectionStatus === 'checking' && 'animate-spin'
          )}
        />
      </Button>
    </div>
  );
}
