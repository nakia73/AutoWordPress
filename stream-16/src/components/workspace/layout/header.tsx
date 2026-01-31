'use client';

import { Sparkles, Settings, User, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSiteStore } from '@/lib/stores';
import { mockUser } from '@/lib/mocks';

export function Header() {
  const { sites, currentSiteId, selectSite, getCurrentSite } = useSiteStore();
  const currentSite = getCurrentSite();

  return (
    <header className="h-16 border-b border-sidebar-border bg-sidebar flex items-center justify-between px-4">
      {/* Left: Logo */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <span className="text-lg font-bold gold-text-gradient">Argo Note</span>
        </div>

        {/* Site Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 min-w-[180px] justify-between">
              <span className="truncate">
                {currentSite?.name || 'サイトを選択'}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            <DropdownMenuLabel>サイト選択</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sites.map((site) => (
              <DropdownMenuItem
                key={site.id}
                onClick={() => selectSite(site.id)}
                className={site.id === currentSiteId ? 'bg-accent' : ''}
              >
                <span className="truncate">{site.name}</span>
                {site.status === 'provisioning' && (
                  <span className="ml-auto text-xs text-yellow-400">準備中</span>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span className="text-primary">+ 新規サイト追加</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Settings & User */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-medium">
                {mockUser.name.charAt(0).toUpperCase()}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{mockUser.name}</span>
                <span className="text-xs text-muted-foreground">{mockUser.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              アカウント設定
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
