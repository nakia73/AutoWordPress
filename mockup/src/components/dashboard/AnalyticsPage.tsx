"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Clock,
  MousePointer,
  Globe,
  Search,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton, SkeletonCard, SkeletonChart } from "@/components/ui/skeleton";

const overviewStats = [
  {
    title: "Page Views",
    value: "12,847",
    change: "+23%",
    trend: "up",
    icon: Eye,
    period: "vs last month",
  },
  {
    title: "Unique Visitors",
    value: "4,312",
    change: "+18%",
    trend: "up",
    icon: Users,
    period: "vs last month",
  },
  {
    title: "Avg. Time on Page",
    value: "4:32",
    change: "+12%",
    trend: "up",
    icon: Clock,
    period: "vs last month",
  },
  {
    title: "Bounce Rate",
    value: "42%",
    change: "-5%",
    trend: "down",
    icon: MousePointer,
    period: "vs last month",
  },
];

const topArticles = [
  {
    title: "10 Essential Tips for Building Scalable React Applications",
    views: 2340,
    avgTime: "5:23",
    bounceRate: "38%",
  },
  {
    title: "Why TypeScript is a Game Changer for Large Codebases",
    views: 1856,
    avgTime: "4:45",
    bounceRate: "42%",
  },
  {
    title: "Understanding WebSockets in Real-Time Applications",
    views: 1234,
    avgTime: "4:12",
    bounceRate: "45%",
  },
  {
    title: "CSS Grid vs Flexbox: When to Use What",
    views: 987,
    avgTime: "3:56",
    bounceRate: "48%",
  },
];

const topKeywords = [
  { keyword: "react scalability", position: 3, volume: 2400, change: "+2" },
  { keyword: "typescript benefits", position: 5, volume: 1800, change: "+1" },
  { keyword: "websocket tutorial", position: 8, volume: 1200, change: "-1" },
  { keyword: "css grid layout", position: 12, volume: 3200, change: "+3" },
  { keyword: "node.js best practices", position: 15, volume: 2800, change: "new" },
];

const trafficSources = [
  { source: "Organic Search", percentage: 62, color: "bg-primary" },
  { source: "Direct", percentage: 18, color: "bg-blue-500" },
  { source: "Social", percentage: 12, color: "bg-purple-500" },
  { source: "Referral", percentage: 8, color: "bg-green-500" },
];

const chartData = [
  { day: "Mon", value: 65 },
  { day: "Tue", value: 78 },
  { day: "Wed", value: 82 },
  { day: "Thu", value: 95 },
  { day: "Fri", value: 88 },
  { day: "Sat", value: 72 },
  { day: "Sun", value: 68 },
];

// Analytics loading skeleton
function AnalyticsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Chart and sources skeleton */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonChart />
        </div>
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-2.5 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom sections skeleton */}
      <div className="grid lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const maxValue = Math.max(...chartData.map((d) => d.value));

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
        <p className="text-muted-foreground">
          Track your blog's performance and growth
        </p>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors relative overflow-hidden group">
              {/* Hover glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <CardContent className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <stat.icon className="w-5 h-5 text-primary" />
                  </motion.div>
                  <motion.div
                    className={`flex items-center gap-1 text-sm ${
                      stat.trend === "up"
                        ? "text-green-400"
                        : stat.trend === "down" && stat.title === "Bounce Rate"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                    animate={{ y: stat.trend === "up" ? [-1, 1, -1] : [1, -1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>{stat.change}</span>
                  </motion.div>
                </div>
                <p className="text-2xl font-bold gold-text-gradient">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {stat.period}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Traffic Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Traffic This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-48 gap-3 px-2">
                {chartData.map((data, index) => (
                  <motion.div
                    key={data.day}
                    className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                  >
                    {/* Value tooltip on hover */}
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {data.value}%
                    </motion.div>
                    {/* Bar */}
                    <div className="w-full h-36 flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(data.value / maxValue) * 100}%` }}
                        transition={{
                          delay: 0.5 + index * 0.1,
                          duration: 0.6,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ scale: 1.05 }}
                        className="relative w-full rounded-t-lg gold-gradient overflow-hidden"
                      >
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent"
                          animate={{ y: ["-100%", "100%"] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3,
                            delay: index * 0.2
                          }}
                        />
                        {/* Glow on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/20 blur-sm" />
                      </motion.div>
                    </div>
                    <motion.span
                      className="text-xs text-muted-foreground group-hover:text-primary transition-colors"
                      whileHover={{ scale: 1.1 }}
                    >
                      {data.day}
                    </motion.span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Traffic Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trafficSources.map((source, index) => (
                <motion.div
                  key={source.source}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors">{source.source}</span>
                    <motion.span
                      className="text-sm font-medium gold-text-gradient"
                      whileHover={{ scale: 1.1 }}
                    >
                      {source.percentage}%
                    </motion.span>
                  </div>
                  <div className="h-2.5 rounded-full bg-secondary/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${source.percentage}%` }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.6, type: "spring" }}
                      className={`h-full rounded-full ${source.color} relative`}
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 2,
                          delay: index * 0.3
                        }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Top Performing Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topArticles.map((article, index) => (
                  <motion.div
                    key={article.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>{article.views.toLocaleString()} views</span>
                        <span>{article.avgTime} avg</span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Keyword Rankings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Keyword Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topKeywords.map((keyword, index) => (
                  <motion.div
                    key={keyword.keyword}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold gold-text-gradient">
                        #{keyword.position}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground">
                        {keyword.keyword}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {keyword.volume.toLocaleString()} searches/mo
                      </p>
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded-full ${
                        keyword.change === "new"
                          ? "bg-blue-500/20 text-blue-400"
                          : keyword.change.startsWith("+")
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {keyword.change === "new" ? "NEW" : keyword.change}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
