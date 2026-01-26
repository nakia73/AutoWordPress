'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Globe,
  Package,
  Calendar,
  Settings,
  ChevronLeft,
  Sparkles,
  Menu,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

type User = {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
};

interface SidebarProps {
  user: User;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { id: 'sites', label: 'Sites', href: '/dashboard/sites', icon: Globe },
  { id: 'products', label: 'Products', href: '/dashboard/products', icon: Package },
  { id: 'articles', label: 'Articles', href: '/dashboard/articles', icon: FileText },
  { id: 'schedules', label: 'Schedules', href: '/dashboard/schedules', icon: Calendar },
  { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

function SidebarContent({
  user,
  collapsed,
  setCollapsed,
  onNavigate,
}: SidebarProps & { collapsed: boolean; setCollapsed: (v: boolean) => void; onNavigate?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2 group" onClick={onNavigate}>
          <motion.div
            className="relative"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="h-7 w-7 text-primary relative z-10" />
            <motion.div
              className="absolute inset-0 blur-md bg-primary/30"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          {!collapsed && (
            <motion.span
              className="text-lg font-bold gold-text-gradient"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              Argo Note
            </motion.span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-foreground hidden lg:flex"
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative overflow-hidden group',
                isActive(item.href)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
                collapsed && 'justify-center px-2'
              )}
            >
              {/* Active background */}
              <AnimatePresence>
                {isActive(item.href) && (
                  <motion.div
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layoutId="activeNavBg"
                  />
                )}
              </AnimatePresence>
              {/* Hover background */}
              {!isActive(item.href) && (
                <motion.div
                  className="absolute inset-0 bg-secondary/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                />
              )}
              {/* Active indicator line */}
              <AnimatePresence>
                {isActive(item.href) && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    exit={{ scaleY: 0 }}
                  />
                )}
              </AnimatePresence>
              <motion.div className="relative z-10">
                <item.icon className="w-5 h-5 flex-shrink-0" />
              </motion.div>
              {!collapsed && (
                <motion.span
                  className="relative z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          </motion.div>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name || user.email || 'User avatar'}
              className="h-8 w-8 rounded-full ring-2 ring-primary/20"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-medium">
              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.name || user.email || 'User'}
              </p>
              {user.name && user.email && (
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              )}
            </div>
          )}
        </div>
        {!collapsed && (
          <form action="/api/auth/signout" method="post" className="mt-3">
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </form>
        )}
      </div>
    </>
  );
}

export function Sidebar({ user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-background/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 bg-sidebar overflow-hidden" showCloseButton={false}>
            <SidebarContent
              user={user}
              collapsed={false}
              setCollapsed={() => {}}
              onNavigate={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 280 }}
        className="hidden lg:flex fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex-col z-40"
      >
        <SidebarContent
          user={user}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </motion.aside>
    </>
  );
}

export function SidebarSpacer({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <motion.div
      animate={{ width: collapsed ? 80 : 280 }}
      className="hidden lg:block flex-shrink-0"
    />
  );
}
