"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  FileText,
  Edit3,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const scheduledArticles = [
  {
    id: 1,
    title: "Understanding WebSockets in Node.js",
    date: "2024-01-28",
    time: "09:00",
    status: "scheduled",
    keywords: ["WebSockets", "Node.js"],
  },
  {
    id: 2,
    title: "Docker Best Practices for Developers",
    date: "2024-01-30",
    time: "10:00",
    status: "scheduled",
    keywords: ["Docker", "DevOps"],
  },
  {
    id: 3,
    title: "Introduction to GraphQL",
    date: "2024-02-01",
    time: "09:00",
    status: "scheduled",
    keywords: ["GraphQL", "API"],
  },
  {
    id: 4,
    title: "React Performance Optimization Tips",
    date: "2024-02-03",
    time: "10:00",
    status: "draft",
    keywords: ["React", "Performance"],
  },
  {
    id: 5,
    title: "Building APIs with Hono.js",
    date: "2024-02-05",
    time: "09:00",
    status: "draft",
    keywords: ["Hono", "API"],
  },
];

const calendarDays = [
  { date: 26, current: false, today: false },
  { date: 27, current: true, today: false },
  { date: 28, current: true, today: false, hasArticle: true },
  { date: 29, current: true, today: false },
  { date: 30, current: true, today: false, hasArticle: true },
  { date: 31, current: true, today: false },
  { date: 1, current: true, today: true, hasArticle: true },
  { date: 2, current: true, today: false },
  { date: 3, current: true, today: false, hasArticle: true },
  { date: 4, current: true, today: false },
  { date: 5, current: true, today: false, hasArticle: true },
  { date: 6, current: true, today: false },
  { date: 7, current: true, today: false },
  { date: 8, current: true, today: false },
];

interface SchedulePageProps {
  onGenerateNew: () => void;
}

// Schedule loading skeleton
function ScheduleSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* Main content skeleton */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar skeleton */}
        <Card className="lg:col-span-2 bg-card/50 border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-2">
                <Skeleton className="w-8 h-8 rounded" />
                <Skeleton className="w-8 h-8 rounded" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <Skeleton key={day} className="h-4 w-full" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar skeleton */}
        <div className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-3 rounded-lg bg-secondary/30 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SchedulePage({ onGenerateNew }: SchedulePageProps) {
  const [currentMonth] = useState("February 2024");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <ScheduleSkeleton />;
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
          <h2 className="text-2xl font-bold text-foreground">Content Schedule</h2>
          <p className="text-muted-foreground">
            Plan and manage your publishing calendar
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
            <span className="relative z-10">Schedule Article</span>
          </Button>
        </motion.div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {currentMonth}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02, type: "spring", stiffness: 200 }}
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: day.current ? "rgba(212, 175, 55, 0.15)" : undefined,
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={`aspect-square p-2 rounded-lg flex flex-col items-center justify-center relative transition-all group ${
                      day.today
                        ? "bg-primary/20 border-2 border-primary/50"
                        : day.current
                        ? "hover:bg-secondary/50 border border-transparent hover:border-primary/30"
                        : "text-muted-foreground/50"
                    }`}
                  >
                    {/* Glow effect for today */}
                    {day.today && (
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-primary/10"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    <span
                      className={`relative z-10 text-sm ${
                        day.today
                          ? "text-primary font-bold"
                          : day.hasArticle
                          ? "text-foreground font-medium"
                          : ""
                      }`}
                    >
                      {day.date}
                    </span>
                    {day.hasArticle && (
                      <motion.div
                        className="absolute bottom-1.5 left-1/2 -translate-x-1/2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.02 + 0.2, type: "spring" }}
                      >
                        <motion.div
                          className="w-2 h-2 rounded-full gold-gradient"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
                        />
                        {/* Subtle glow */}
                        <div className="absolute inset-0 w-2 h-2 rounded-full bg-primary blur-sm opacity-50" />
                      </motion.div>
                    )}
                    {/* Hover tooltip indicator */}
                    {day.hasArticle && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-background opacity-0 group-hover:opacity-100"
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1 }}
                      >
                        <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-bold">
                          1
                        </span>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full border border-primary" />
                  <span>Today</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Schedule Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Auto-Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div
                className="p-4 rounded-lg bg-primary/5 border border-primary/20 relative overflow-hidden"
                whileHover={{ scale: 1.01, borderColor: "rgba(212, 175, 55, 0.4)" }}
              >
                {/* Subtle shimmer */}
                <motion.div
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/5 to-transparent"
                  animate={{ translateX: ["100%", "-100%"] }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Publishing Frequency
                    </span>
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <motion.span
                          className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"
                          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        Active
                      </Badge>
                    </motion.div>
                  </div>
                  <motion.p
                    className="text-2xl font-bold gold-text-gradient"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    2x per week
                  </motion.p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tuesdays & Thursdays at 9:00 AM
                  </p>
                </div>
              </motion.div>

              <div className="space-y-3">
                {[
                  { label: "Next publish", value: "Jan 28, 9:00 AM" },
                  { label: "Queue depth", value: "5 articles" },
                  { label: "Timezone", value: "UTC+9 (JST)" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    whileHover={{ x: 3, backgroundColor: "rgba(212, 175, 55, 0.05)" }}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 transition-colors cursor-default"
                  >
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium text-foreground">
                      {item.value}
                    </span>
                  </motion.div>
                ))}
              </div>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Schedule Settings
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Articles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Upcoming Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ x: 4, scale: 1.01 }}
                  className="relative flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all group overflow-hidden cursor-pointer"
                >
                  {/* Hover gradient */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                  {/* Timeline connector */}
                  {index < scheduledArticles.length - 1 && (
                    <div className="absolute left-[30px] top-full w-0.5 h-4 bg-gradient-to-b from-primary/30 to-transparent" />
                  )}

                  <motion.div
                    className="relative w-14 text-center flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-primary/10 opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.3 }}
                    />
                    <p className="relative text-xs text-muted-foreground">
                      {new Date(article.date).toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </p>
                    <motion.p
                      className="relative text-2xl font-bold gold-text-gradient"
                      animate={article.status === "scheduled" ? {} : {}}
                    >
                      {new Date(article.date).getDate()}
                    </motion.p>
                    {article.status === "scheduled" && (
                      <motion.div
                        className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-blue-500"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>

                  <div className="relative flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {article.title}
                      </h4>
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Badge
                          variant="outline"
                          className={
                            article.status === "scheduled"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {article.status === "scheduled" ? "Scheduled" : "Draft"}
                        </Badge>
                      </motion.div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <motion.span
                        className="flex items-center gap-1"
                        whileHover={{ color: "rgb(212, 175, 55)" }}
                      >
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        >
                          <Clock className="w-3 h-3" />
                        </motion.div>
                        {article.time}
                      </motion.span>
                      <div className="flex gap-2">
                        {article.keywords.map((keyword, i) => (
                          <motion.span
                            key={keyword}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + index * 0.1 + i * 0.05 }}
                            whileHover={{ scale: 1.1, backgroundColor: "rgba(212, 175, 55, 0.2)" }}
                            className="px-2 py-0.5 text-xs rounded-full bg-secondary/50 transition-colors"
                          >
                            {keyword}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <motion.div
                    className="relative flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: 10 }}
                    whileHover={{ x: 0 }}
                  >
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full mt-4 border-primary/30 text-primary hover:bg-primary/10"
              onClick={onGenerateNew}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate More Articles
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
