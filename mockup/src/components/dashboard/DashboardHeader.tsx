"use client";

import { motion } from "framer-motion";
import { Bell, Search, User, ChevronDown, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onBackToLanding?: () => void;
}

export default function DashboardHeader({
  title,
  subtitle,
  onBackToLanding,
}: DashboardHeaderProps) {
  return (
    <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6">
      {/* Title */}
      <div>
        <motion.h1
          key={title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl font-semibold text-foreground"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            key={subtitle}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-muted-foreground"
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {/* Right Side */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-4"
      >
        {/* Search */}
        <motion.div
          className="relative hidden md:block group"
          whileHover={{ scale: 1.01 }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search..."
            className="w-64 pl-9 h-9 bg-secondary/50 border-border/50 focus:border-primary transition-all"
          />
        </motion.div>

        {/* Notifications */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <motion.span
              className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </Button>
        </motion.div>

        {/* User Menu */}
        <motion.button
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/50 to-primary/20 flex items-center justify-center"
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <User className="w-4 h-4 text-primary" />
          </motion.div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.button>

        {/* Back to Landing (Demo) */}
        {onBackToLanding && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToLanding}
              className="text-muted-foreground hover:text-foreground"
            >
              <motion.div
                animate={{ x: [0, -2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <LogOut className="w-4 h-4 mr-2" />
              </motion.div>
              Exit Demo
            </Button>
          </motion.div>
        )}
      </motion.div>
    </header>
  );
}
