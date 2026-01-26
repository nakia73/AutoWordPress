"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Eye,
  Calendar,
  ExternalLink,
  MoreVertical,
  Search,
  Plus,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WordPressPreview from "./WordPressPreview";
import { Skeleton, SkeletonArticle } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

const articles = [
  {
    id: 1,
    title: "10 Essential Tips for Building Scalable React Applications",
    excerpt:
      "Learn the best practices for building React apps that can handle millions of users...",
    status: "published",
    views: 2340,
    keywords: ["React", "Scalability", "Performance"],
    publishedAt: "2024-01-24",
    readTime: "8 min",
    content: "Full article content here...",
  },
  {
    id: 2,
    title: "Why TypeScript is a Game Changer for Large Codebases",
    excerpt:
      "Discover how TypeScript can improve your code quality and developer experience...",
    status: "published",
    views: 1856,
    keywords: ["TypeScript", "JavaScript", "Code Quality"],
    publishedAt: "2024-01-23",
    readTime: "6 min",
    content: "Full article content here...",
  },
  {
    id: 3,
    title: "The Future of AI in Software Development",
    excerpt:
      "Exploring how artificial intelligence is transforming the way we write code...",
    status: "generating",
    views: 0,
    keywords: ["AI", "Development", "Future Tech"],
    publishedAt: null,
    readTime: "10 min",
    progress: 65,
    content: "",
  },
  {
    id: 4,
    title: "Mastering CSS Grid: A Complete Guide",
    excerpt:
      "Everything you need to know about CSS Grid layout for modern web design...",
    status: "scheduled",
    views: 0,
    keywords: ["CSS", "Grid", "Layout"],
    publishedAt: "2024-01-26",
    readTime: "12 min",
    content: "Full article content here...",
  },
  {
    id: 5,
    title: "Understanding WebSockets in Node.js",
    excerpt:
      "A deep dive into real-time communication with WebSockets and Node.js...",
    status: "scheduled",
    views: 0,
    keywords: ["WebSockets", "Node.js", "Real-time"],
    publishedAt: "2024-01-28",
    readTime: "7 min",
    content: "Full article content here...",
  },
  {
    id: 6,
    title: "Docker Best Practices for Developers",
    excerpt:
      "Optimize your Docker workflow with these proven best practices...",
    status: "draft",
    views: 0,
    keywords: ["Docker", "DevOps", "Containers"],
    publishedAt: null,
    readTime: "9 min",
    content: "Full article content here...",
  },
];

const statusConfig = {
  published: {
    label: "Published",
    icon: CheckCircle,
    color: "bg-green-500/10 text-green-400 border-green-500/30",
  },
  generating: {
    label: "Generating",
    icon: Sparkles,
    color: "bg-primary/10 text-primary border-primary/30",
  },
  scheduled: {
    label: "Scheduled",
    icon: Calendar,
    color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  draft: {
    label: "Draft",
    icon: FileText,
    color: "bg-muted text-muted-foreground border-border",
  },
  failed: {
    label: "Failed",
    icon: AlertCircle,
    color: "bg-red-500/10 text-red-400 border-red-500/30",
  },
};

interface ArticlesListProps {
  onGenerateNew: () => void;
}

// Articles loading skeleton
function ArticlesListSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1 max-w-sm rounded-lg" />
        <Skeleton className="h-10 w-64 rounded-lg" />
      </div>

      {/* Articles skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex gap-2">
                      {[...Array(3)].map((_, j) => (
                        <Skeleton key={j} className="h-5 w-16 rounded-full" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function ArticlesList({ onGenerateNew }: ArticlesListProps) {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<typeof articles[0] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleArticleAction = (action: string, title: string) => {
    switch (action) {
      case "edit":
        toast.info("Edit Mode", `Opening editor for "${title.slice(0, 30)}..."`);
        break;
      case "publish":
        toast.success("Article Published", `"${title.slice(0, 30)}..." is now live.`);
        break;
      case "schedule":
        toast.info("Article Scheduled", `"${title.slice(0, 30)}..." will be published tomorrow.`);
        break;
      case "delete":
        toast.warning("Article Deleted", `"${title.slice(0, 30)}..." has been removed.`);
        break;
    }
  };

  const filteredArticles = articles.filter((article) => {
    if (filter !== "all" && article.status !== filter) return false;
    if (
      searchQuery &&
      !article.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const handleArticleClick = (article: typeof articles[0]) => {
    if (article.status !== "generating") {
      setSelectedArticle(article);
    }
  };

  if (isLoading) {
    return <ArticlesListSkeleton />;
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
          <h2 className="text-2xl font-bold text-foreground">Articles</h2>
          <p className="text-muted-foreground">
            Manage your AI-generated content
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className="gold-gradient text-primary-foreground font-medium gold-glow-sm relative overflow-hidden group"
            onClick={onGenerateNew}
          >
            <motion.div
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            <motion.div
              animate={{ rotate: [0, 90, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="relative z-10"
            >
              <Plus className="w-4 h-4 mr-2" />
            </motion.div>
            <span className="relative z-10">Generate New Article</span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-border/50 focus:border-primary"
          />
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="generating">Generating</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Articles Grid */}
      <div className="grid gap-4">
        {filteredArticles.map((article, index) => {
          const statusInfo = statusConfig[article.status as keyof typeof statusConfig];
          const StatusIcon = statusInfo.icon;

          return (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Card
                className="bg-card/50 border-border/50 hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
                onClick={() => handleArticleClick(article)}
              >
                {/* Hover glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <motion.div
                      className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <FileText className="w-6 h-6 text-primary" />
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {article.title}
                          </h3>
                          <Badge variant="outline" className={statusInfo.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>

                      {/* Progress Bar for Generating */}
                      {article.status === "generating" && article.progress && (
                        <motion.div
                          className="mb-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <motion.span
                              animate={{ opacity: [1, 0.6, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3 text-primary" />
                              Generating content...
                            </motion.span>
                            <span className="text-primary font-medium">{article.progress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full gold-gradient relative"
                              initial={{ width: 0 }}
                              animate={{ width: `${article.progress}%` }}
                              transition={{ duration: 1 }}
                            >
                              {/* Shimmer effect */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                            </motion.div>
                          </div>
                        </motion.div>
                      )}

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {article.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {article.publishedAt}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readTime}
                        </span>
                        {article.views > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {article.views.toLocaleString()} views
                          </span>
                        )}
                      </div>

                      {/* Keywords */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {article.keywords.map((keyword, i) => (
                          <motion.span
                            key={keyword}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(212, 175, 55, 0.1)" }}
                            className="px-2 py-0.5 text-xs rounded-full bg-secondary/50 text-muted-foreground hover:text-primary transition-colors cursor-default"
                          >
                            {keyword}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    {article.status === "published" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedArticle(article);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No articles found
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try a different search term"
              : "Start generating your first AI-powered article"}
          </p>
          <Button
            className="gold-gradient text-primary-foreground"
            onClick={onGenerateNew}
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate Article
          </Button>
        </div>
      )}

      {/* WordPress Preview Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <WordPressPreview
            article={{
              title: selectedArticle.title,
              content: selectedArticle.content,
              category: selectedArticle.keywords[0],
              tags: selectedArticle.keywords,
              date: selectedArticle.publishedAt || undefined,
            }}
            onClose={() => setSelectedArticle(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
