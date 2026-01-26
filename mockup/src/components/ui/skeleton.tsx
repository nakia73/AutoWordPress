"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "circular" | "text" | "card";
  animate?: boolean;
}

function Skeleton({ className, variant = "default", animate = true }: SkeletonProps) {
  const baseClasses = "bg-primary/10 rounded";

  const variantClasses = {
    default: "h-4 w-full",
    circular: "rounded-full",
    text: "h-4 w-3/4",
    card: "h-32 w-full rounded-xl",
  };

  if (!animate) {
    return (
      <div className={cn(baseClasses, variantClasses[variant], className)} />
    );
  }

  return (
    <motion.div
      className={cn(baseClasses, variantClasses[variant], "relative overflow-hidden", className)}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

// Skeleton presets for common UI patterns
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 rounded-xl border border-border/50 bg-card/50 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-1 w-full mt-3" />
    </div>
  );
}

function SkeletonArticle({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50", className)}>
      <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}

function SkeletonStats({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {[...Array(4)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

function SkeletonTable({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {[...Array(rows)].map((_, i) => (
        <SkeletonArticle key={i} />
      ))}
    </div>
  );
}

function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 rounded-xl border border-border/50 bg-card/50", className)}>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="flex items-end justify-between h-48 gap-3">
        {[...Array(7)].map((_, i) => (
          <motion.div
            key={i}
            className="flex-1 bg-primary/10 rounded-t-lg"
            initial={{ height: 0 }}
            animate={{ height: `${30 + Math.random() * 60}%` }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-3">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <Skeleton key={day} className="h-3 w-8" />
        ))}
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonArticle,
  SkeletonStats,
  SkeletonTable,
  SkeletonChart
};
