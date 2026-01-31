'use client';

import { ChevronDown, Globe, Plus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSiteStore, type Site } from '@/lib/stores';
import { cn } from '@/lib/utils';

interface SiteSwitcherProps {
  compact?: boolean;
}

export function SiteSwitcher({ compact = false }: SiteSwitcherProps) {
  const { sites, currentSiteId, selectSite, getCurrentSite } = useSiteStore();
  const currentSite = getCurrentSite();

  const getStatusIcon = (status: Site['status']) => {
    switch (status) {
      case 'active':
        return <div className="w-2 h-2 rounded-full bg-green-500" />;
      case 'provisioning':
        return <Loader2 className="w-3 h-3 animate-spin text-yellow-500" />;
      case 'error':
        return <div className="w-2 h-2 rounded-full bg-red-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'justify-start gap-2',
            compact ? 'h-9 px-2' : 'h-10 px-3'
          )}
        >
          <Globe className="h-4 w-4 text-primary" />
          <span className={cn('truncate', compact ? 'max-w-[120px]' : 'max-w-[180px]')}>
            {currentSite?.name || 'サイトを選択'}
          </span>
          {currentSite && getStatusIcon(currentSite.status)}
          <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>接続中のサイト</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sites.map((site) => (
          <DropdownMenuItem
            key={site.id}
            onClick={() => selectSite(site.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            {getStatusIcon(site.status)}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{site.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {site.url}
              </div>
            </div>
            {currentSiteId === site.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          新規サイトを追加
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
