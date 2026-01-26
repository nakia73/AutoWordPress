"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  TrendingUp,
  FileText,
  Eye,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard, SkeletonArticle } from "@/components/ui/skeleton";

// Animated counter component
function AnimatedCounter({ value, duration = 2 }: { value: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    // Parse the numeric value
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
    const suffix = value.replace(/[0-9.,]/g, "");
    const hasComma = value.includes(",");
    const isTime = value.includes(":");

    if (isTime) {
      // Handle time format (e.g., "4:32")
      const [minutes, seconds] = value.split(":").map(Number);
      const totalSeconds = minutes * 60 + seconds;
      let startTime: number;

      const animateTime = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        const currentSeconds = Math.floor(progress * totalSeconds);
        const mins = Math.floor(currentSeconds / 60);
        const secs = currentSeconds % 60;
        setDisplayValue(`${mins}:${secs.toString().padStart(2, "0")}`);

        if (progress < 1) {
          requestAnimationFrame(animateTime);
        } else {
          setDisplayValue(value);
        }
      };
      requestAnimationFrame(animateTime);
    } else {
      // Handle numeric values
      let startTime: number;

      const animateNumber = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        // Ease out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(easeProgress * numericValue);

        if (hasComma) {
          setDisplayValue(currentValue.toLocaleString() + suffix);
        } else {
          setDisplayValue(currentValue + suffix);
        }

        if (progress < 1) {
          requestAnimationFrame(animateNumber);
        } else {
          setDisplayValue(value);
        }
      };
      requestAnimationFrame(animateNumber);
    }
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

const stats = [
  {
    title: "Total Views",
    value: "12,847",
    change: "+23%",
    trend: "up",
    icon: Eye,
  },
  {
    title: "Articles Published",
    value: "12",
    change: "+4",
    trend: "up",
    icon: FileText,
  },
  {
    title: "Avg. Read Time",
    value: "4:32",
    change: "+12%",
    trend: "up",
    icon: Clock,
  },
  {
    title: "Keywords Ranking",
    value: "48",
    change: "+8",
    trend: "up",
    icon: TrendingUp,
  },
];

const recentArticles = [
  {
    title: "10 Essential Tips for Building Scalable React Applications",
    status: "published",
    views: 2340,
    date: "2 hours ago",
  },
  {
    title: "Why TypeScript is a Game Changer for Large Codebases",
    status: "published",
    views: 1856,
    date: "1 day ago",
  },
  {
    title: "The Future of AI in Software Development",
    status: "generating",
    views: 0,
    date: "In progress",
  },
  {
    title: "Mastering CSS Grid: A Complete Guide",
    status: "scheduled",
    views: 0,
    date: "Tomorrow, 9:00 AM",
  },
];

const upcomingArticles = [
  { title: "Understanding WebSockets in Node.js", date: "Jan 28" },
  { title: "Docker Best Practices for Developers", date: "Jan 30" },
  { title: "Introduction to GraphQL", date: "Feb 1" },
];

interface DashboardHomeProps {
  onNavigate: (page: string) => void;
}

// Loading skeleton for the welcome banner
function WelcomeBannerSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-primary/20 animate-pulse" />
          <div className="h-4 w-20 rounded bg-primary/10 animate-pulse" />
        </div>
        <div className="h-6 w-64 rounded bg-primary/10 animate-pulse" />
        <div className="h-4 w-96 rounded bg-primary/10 animate-pulse" />
        <div className="h-10 w-36 rounded-lg bg-primary/20 animate-pulse" />
      </div>
    </div>
  );
}

export default function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Show skeleton loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <WelcomeBannerSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-6 w-32 rounded bg-primary/10 animate-pulse" />
            {[...Array(4)].map((_, i) => (
              <SkeletonArticle key={i} />
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-6 w-24 rounded bg-primary/10 animate-pulse" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-12 h-12 rounded bg-primary/10 animate-pulse" />
                <div className="flex-1 h-16 rounded-lg bg-secondary/30 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-6"
      >
        {/* Animated background elements */}
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
          animate={{
            x: [20, 40, 20],
            y: [-30, -50, -30],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-48 h-48 bg-primary/5 rounded-full blur-2xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-primary/40 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
        <div className="relative z-10">
          <motion.div
            className="flex items-center gap-2 mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-5 h-5 text-primary" />
            </motion.div>
            <span className="text-sm text-primary font-medium">AI Update</span>
            <motion.div
              className="w-2 h-2 rounded-full bg-green-400"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
          <motion.h2
            className="text-xl font-semibold text-foreground mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Your blog is performing great!
          </motion.h2>
          <motion.p
            className="text-muted-foreground mb-4 max-w-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Traffic is up 23% this week. Your article on React applications is trending.
            The AI has identified 5 new high-potential keywords for next week.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              className="gold-gradient text-primary-foreground font-medium gold-glow-sm group"
              onClick={() => onNavigate("suggestions")}
            >
              <span>View Content Ideas</span>
              <motion.span
                className="inline-block ml-1"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: index * 0.1,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            <Card className="relative bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 overflow-hidden group">
              {/* Hover glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              {/* Animated border glow */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{
                  duration: 3,
                  delay: index * 0.5,
                  repeat: Infinity,
                  repeatDelay: 5
                }}
                style={{
                  boxShadow: "inset 0 0 20px rgba(212, 175, 55, 0.3)"
                }}
              />
              <CardContent className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <stat.icon className="w-5 h-5 text-primary" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${
                      stat.trend === "up"
                        ? "text-green-400 bg-green-500/10"
                        : "text-red-400 bg-red-500/10"
                    }`}
                  >
                    <motion.div
                      animate={{ y: stat.trend === "up" ? [-2, 0, -2] : [0, 2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </motion.div>
                    <span className="font-medium">{stat.change}</span>
                  </motion.div>
                </div>
                <motion.p
                  className="text-3xl font-bold gold-text-gradient mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <AnimatedCounter value={stat.value} duration={1.5 + index * 0.3} />
                </motion.p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                {/* Progress indicator line */}
                <motion.div
                  className="mt-3 h-1 bg-secondary/50 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <motion.div
                    className="h-full gold-gradient rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${60 + index * 10}%` }}
                    transition={{
                      delay: 1 + index * 0.1,
                      duration: 1,
                      ease: "easeOut"
                    }}
                  />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Articles</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary"
                onClick={() => onNavigate("articles")}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentArticles.map((article, index) => (
                <motion.div
                  key={article.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground truncate">
                        {article.title}
                      </h4>
                      {article.status === "generating" && (
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/30 animate-pulse"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Generating
                        </Badge>
                      )}
                      {article.status === "scheduled" && (
                        <Badge
                          variant="outline"
                          className="bg-blue-500/10 text-blue-400 border-blue-500/30"
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          Scheduled
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{article.date}</span>
                      {article.views > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.views.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Upcoming</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary"
                onClick={() => onNavigate("schedule")}
              >
                Manage
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingArticles.map((article, index) => (
                <motion.div
                  key={article.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-12 text-center">
                    <p className="text-xs text-muted-foreground">
                      {article.date.split(" ")[0]}
                    </p>
                    <p className="text-lg font-bold gold-text-gradient">
                      {article.date.split(" ")[1]}
                    </p>
                  </div>
                  <div className="flex-1 p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <p className="text-sm font-medium text-foreground">
                      {article.title}
                    </p>
                  </div>
                </motion.div>
              ))}

              <Button
                variant="outline"
                className="w-full mt-4 border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => onNavigate("suggestions")}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate New Ideas
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
