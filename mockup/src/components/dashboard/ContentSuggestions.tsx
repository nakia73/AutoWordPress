"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  TrendingUp,
  Search,
  Sparkles,
  ChevronRight,
  Check,
  RefreshCw,
  Zap,
  Target,
  BarChart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

const suggestions = [
  {
    id: 1,
    title: "Next.js 14 Server Components: A Complete Migration Guide",
    keyword: "next.js server components",
    searchVolume: 12400,
    difficulty: "Medium",
    potential: "High",
    relevance: 95,
    reasons: [
      "Trending topic in React ecosystem",
      "Low competition for long-tail",
      "Matches your tech niche",
    ],
  },
  {
    id: 2,
    title: "Building Real-Time Apps with Supabase and React",
    keyword: "supabase react tutorial",
    searchVolume: 8900,
    difficulty: "Low",
    potential: "High",
    relevance: 92,
    reasons: [
      "Rising search interest",
      "Aligns with your backend content",
      "High conversion potential",
    ],
  },
  {
    id: 3,
    title: "The Complete Guide to Tailwind CSS v4 Features",
    keyword: "tailwind css v4",
    searchVolume: 6700,
    difficulty: "Medium",
    potential: "Medium",
    relevance: 88,
    reasons: [
      "New version release",
      "Your audience uses Tailwind",
      "Good for featured snippets",
    ],
  },
  {
    id: 4,
    title: "Deploying Edge Functions: Vercel vs Cloudflare",
    keyword: "edge functions comparison",
    searchVolume: 4200,
    difficulty: "Low",
    potential: "High",
    relevance: 85,
    reasons: [
      "Decision-making content ranks well",
      "Low competition",
      "Targets developers",
    ],
  },
  {
    id: 5,
    title: "Testing React Apps with Vitest: Best Practices",
    keyword: "vitest react testing",
    searchVolume: 5800,
    difficulty: "Low",
    potential: "Medium",
    relevance: 82,
    reasons: [
      "Growing adoption of Vitest",
      "Practical how-to content",
      "Links to your React articles",
    ],
  },
];

const difficultyColors = {
  Low: "bg-green-500/10 text-green-400 border-green-500/30",
  Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  High: "bg-red-500/10 text-red-400 border-red-500/30",
};

const potentialColors = {
  Low: "text-muted-foreground",
  Medium: "text-yellow-400",
  High: "text-green-400",
};

interface ContentSuggestionsProps {
  onSelectSuggestion: (suggestion: typeof suggestions[0]) => void;
}

// Skeleton loading component for suggestions
function SuggestionsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      {/* AI Insight skeleton */}
      <div className="p-6 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="flex items-start gap-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>

      {/* Suggestion cards skeleton */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-xl border border-border/50 bg-card/50"
          >
            <div className="flex items-start gap-4">
              <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-28 rounded-lg" />
                </div>
                <div className="flex gap-6">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function ContentSuggestions({
  onSelectSuggestion,
}: ContentSuggestionsProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Ideas Refreshed", "Found 6 new content suggestions for you.");
    }, 1500);
  };

  if (isLoading) {
    return <SuggestionsSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-foreground">Content Ideas</h2>
          <p className="text-muted-foreground">
            AI-powered topic suggestions based on your niche
          </p>
        </div>
        <div className="flex gap-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              className="border-border/50 hover:border-primary/50"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <motion.div
                animate={isRefreshing ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
              </motion.div>
              Refresh Ideas
            </Button>
          </motion.div>
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="gold-gradient text-primary-foreground font-medium gold-glow-sm relative overflow-hidden group"
                  onClick={() => {
                    const selected = suggestions.find((s) =>
                      selectedIds.includes(s.id)
                    );
                    if (selected) onSelectSuggestion(selected);
                  }}
                >
                  <motion.div
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative z-10"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                  </motion.div>
                  <span className="relative z-10">
                    Generate {selectedIds.length} Article
                    {selectedIds.length > 1 ? "s" : ""}
                  </span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* AI Insight Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 relative overflow-hidden">
          {/* Animated background particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 bg-primary/5 rounded-full blur-2xl"
              style={{
                left: `${20 + i * 30}%`,
                top: `${10 + (i % 2) * 40}%`,
              }}
              animate={{
                x: [0, 20, 0],
                y: [0, -15, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
          <CardContent className="relative z-10 p-6">
            <div className="flex items-start gap-4">
              <motion.div
                className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center gold-glow-sm"
                whileHover={{ scale: 1.1, rotate: 5 }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </motion.div>
              <div className="flex-1">
                <motion.h3
                  className="font-semibold text-foreground mb-1 flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  AI Analysis Complete
                  <motion.span
                    className="w-2 h-2 rounded-full bg-green-400"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.h3>
                <motion.p
                  className="text-sm text-muted-foreground mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Based on your niche (Tech/Development), current trends, and
                  competitor analysis, here are the top 5 content opportunities
                  for maximum SEO impact.
                </motion.p>
                <div className="flex flex-wrap gap-4 text-sm">
                  {[
                    { icon: Target, text: "5 high-potential topics", color: "text-primary" },
                    { icon: TrendingUp, text: "38,000 total monthly searches", color: "text-green-400" },
                    { icon: Zap, text: "Updated 2 hours ago", color: "text-yellow-400" },
                  ].map((item, i) => (
                    <motion.div
                      key={item.text}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      whileHover={{ x: 3 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                      >
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </motion.div>
                      <span className="text-muted-foreground">
                        {item.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card
              className={`relative bg-card/50 border-border/50 transition-all cursor-pointer overflow-hidden group ${
                selectedIds.includes(suggestion.id)
                  ? "border-primary/50 bg-primary/5"
                  : "hover:border-primary/30"
              }`}
              onClick={() => handleSelect(suggestion.id)}
            >
              {/* Hover gradient overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
              {/* Animated shine effect on hover */}
              <motion.div
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
              />
              <CardContent className="relative z-10 p-6">
                <div className="flex items-start gap-4">
                  {/* Selection Indicator */}
                  <motion.div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedIds.includes(suggestion.id)
                        ? "bg-primary border-primary"
                        : "border-border/50 group-hover:border-primary/50"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <AnimatePresence mode="wait">
                      {selectedIds.includes(suggestion.id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                          {suggestion.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <motion.div
                            className="group-hover:text-primary transition-colors"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Search className="w-3 h-3" />
                          </motion.div>
                          <span>Keyword: <span className="text-foreground/80">{suggestion.keyword}</span></span>
                        </div>
                      </div>
                      <motion.div
                        className="text-right flex-shrink-0"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                      >
                        <motion.p
                          className="text-3xl font-bold gold-text-shimmer"
                          whileHover={{ scale: 1.1 }}
                        >
                          {suggestion.relevance}%
                        </motion.p>
                        <p className="text-xs text-muted-foreground">
                          relevance
                        </p>
                      </motion.div>
                    </div>

                    {/* Metrics */}
                    <div className="flex flex-wrap gap-4 mb-4">
                      <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ x: 3 }}
                      >
                        <motion.div
                          animate={{ y: [0, -2, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        >
                          <BarChart className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </motion.div>
                        <span className="text-sm">
                          <span className="text-foreground font-medium">
                            {suggestion.searchVolume.toLocaleString()}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            monthly searches
                          </span>
                        </span>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Badge
                          variant="outline"
                          className={
                            difficultyColors[
                              suggestion.difficulty as keyof typeof difficultyColors
                            ]
                          }
                        >
                          {suggestion.difficulty} difficulty
                        </Badge>
                      </motion.div>
                      <motion.div
                        className="flex items-center gap-1"
                        whileHover={{ x: 3 }}
                      >
                        <motion.div
                          animate={suggestion.potential === "High" ? { y: [0, -3, 0] } : {}}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <TrendingUp
                            className={`w-4 h-4 ${
                              potentialColors[
                                suggestion.potential as keyof typeof potentialColors
                              ]
                            }`}
                          />
                        </motion.div>
                        <span
                          className={`text-sm ${
                            potentialColors[
                              suggestion.potential as keyof typeof potentialColors
                            ]
                          }`}
                        >
                          {suggestion.potential} potential
                        </span>
                      </motion.div>
                    </div>

                    {/* Reasons */}
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        Why this topic?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.reasons.map((reason, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 + i * 0.05 + 0.3 }}
                            whileHover={{
                              scale: 1.05,
                              backgroundColor: "rgba(212, 175, 55, 0.1)",
                            }}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground transition-colors cursor-default"
                          >
                            <motion.div
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                            >
                              <Lightbulb className="w-3 h-3 text-primary" />
                            </motion.div>
                            {reason}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <motion.div
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSuggestion(suggestion);
                      }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
