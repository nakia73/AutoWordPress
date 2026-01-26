"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Lightbulb,
  Settings,
  ExternalLink,
  ChevronLeft,
  Sparkles,
  BarChart3,
  Calendar,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "articles", label: "Articles", icon: FileText },
  { id: "suggestions", label: "Content Ideas", icon: Lightbulb },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

function SidebarContent({
  currentPage,
  onNavigate,
  collapsed,
  setCollapsed,
}: SidebarProps & { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  return (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <motion.a
          href="/"
          className="flex items-center gap-2 group"
          animate={{ opacity: collapsed ? 0 : 1 }}
          whileHover={{ scale: 1.02 }}
        >
          <motion.div
            className="relative"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
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
        </motion.a>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-foreground hidden lg:flex"
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.div>
          </Button>
        </motion.div>
      </div>

      {/* Blog Info */}
      <div className="p-4 border-b border-sidebar-border">
        <motion.div
          className={cn(
            "p-3 rounded-lg bg-primary/5 border border-primary/20 relative overflow-hidden",
            collapsed && "p-2"
          )}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {collapsed ? (
            <motion.div
              className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center"
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-xs font-bold text-primary-foreground">T</span>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground text-sm">Tech Blog</span>
                <motion.span
                  className="relative text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {/* Pulsing indicator */}
                  <motion.span
                    className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  Active
                </motion.span>
              </div>
              <motion.a
                href="#"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors group"
                whileHover={{ x: 2 }}
              >
                <span>techblog.argonote.com</span>
                <motion.div
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                >
                  <ExternalLink className="w-3 h-3" />
                </motion.div>
              </motion.a>
            </>
          )}
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: collapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative overflow-hidden group",
              currentPage === item.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            {/* Active background */}
            <AnimatePresence>
              {currentPage === item.id && (
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
            {currentPage !== item.id && (
              <motion.div
                className="absolute inset-0 bg-secondary/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              />
            )}
            {/* Active indicator line */}
            <AnimatePresence>
              {currentPage === item.id && (
                <motion.div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  exit={{ scaleY: 0 }}
                />
              )}
            </AnimatePresence>
            <motion.div
              className="relative z-10"
              animate={currentPage === item.id ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
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
          </motion.button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-sidebar-border">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 relative overflow-hidden group"
            >
              {/* Subtle shimmer effect */}
              <motion.div
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
              />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                  </motion.div>
                  <span className="text-sm font-medium text-foreground">Pro Plan</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  4 articles remaining this month
                </p>
                <div className="w-full h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                  <motion.div
                    className="h-full gold-gradient"
                    initial={{ width: 0 }}
                    animate={{ width: "25%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="icon"
                className="bg-background/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <motion.div
                  animate={mobileOpen ? { rotate: 90 } : { rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Menu className="w-5 h-5 relative z-10" />
                </motion.div>
              </Button>
            </motion.div>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 bg-sidebar overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                className="absolute top-32 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-20 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 6, repeat: Infinity, delay: 1 }}
              />
            </div>

            <SidebarContent
              currentPage={currentPage}
              onNavigate={(page) => {
                onNavigate(page);
                setMobileOpen(false);
              }}
              collapsed={false}
              setCollapsed={() => {}}
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
          currentPage={currentPage}
          onNavigate={onNavigate}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </motion.aside>
    </>
  );
}
