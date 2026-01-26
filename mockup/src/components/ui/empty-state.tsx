"use client";

import { motion } from "framer-motion";
import { LucideIcon, FileText, Search, Calendar, Inbox, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "search" | "articles" | "schedule";
}

const variantIcons = {
  default: Inbox,
  search: Search,
  articles: FileText,
  schedule: Calendar,
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = "default",
}: EmptyStateProps) {
  const Icon = icon || variantIcons[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Animated icon container */}
      <motion.div
        className="relative mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
      >
        {/* Background glow */}
        <motion.div
          className="absolute inset-0 bg-primary/10 rounded-full blur-2xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Icon container */}
        <motion.div
          className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center"
          whileHover={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="w-10 h-10 text-primary/60" />
        </motion.div>

        {/* Decorative particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-primary/40 rounded-full"
            style={{
              top: `${20 + i * 25}%`,
              left: i % 2 === 0 ? "-20%" : "120%",
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </motion.div>

      {/* Title */}
      <motion.h3
        className="text-xl font-semibold text-foreground mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        className="text-muted-foreground max-w-sm mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {description}
      </motion.p>

      {/* Action button */}
      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={onAction}
            className="gold-gradient text-primary-foreground font-medium gold-glow-sm relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            <Sparkles className="w-4 h-4 mr-2 relative z-10" />
            <span className="relative z-10">{actionLabel}</span>
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Preset empty states
export function NoArticlesEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      variant="articles"
      title="No articles yet"
      description="Start creating content to grow your blog. AI will help you write SEO-optimized articles."
      actionLabel="Create First Article"
      onAction={onAction}
    />
  );
}

export function NoSearchResultsEmpty({ query }: { query: string }) {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      description={`We couldn't find any results for "${query}". Try adjusting your search terms.`}
    />
  );
}

export function NoScheduledEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      variant="schedule"
      title="No scheduled content"
      description="Plan your content calendar by scheduling articles for automatic publishing."
      actionLabel="Schedule Article"
      onAction={onAction}
    />
  );
}
