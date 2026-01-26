"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  Share2,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WordPressPreviewProps {
  article: {
    title: string;
    content: string;
    featuredImage?: string;
    author?: string;
    date?: string;
    category?: string;
    tags?: string[];
  };
  onClose: () => void;
}

type DeviceType = "desktop" | "tablet" | "mobile";

export default function WordPressPreview({
  article,
  onClose,
}: WordPressPreviewProps) {
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const deviceWidths = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="h-14 border-b border-border/50 bg-card/80 backdrop-blur-xl flex items-center justify-between px-4"
      >
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </motion.div>
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                <motion.span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                Preview
              </Badge>
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground hidden md:inline"
            >
              techblog.argonote.com
            </motion.span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2"
        >
          {/* Device Toggle */}
          <div className="hidden md:flex items-center gap-1 p-1 bg-secondary/50 rounded-lg relative">
            {[
              { id: "desktop" as DeviceType, icon: Monitor },
              { id: "tablet" as DeviceType, icon: Tablet },
              { id: "mobile" as DeviceType, icon: Smartphone },
            ].map((item) => (
              <motion.div key={item.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 relative ${device === item.id ? "text-primary" : ""}`}
                  onClick={() => setDevice(item.id)}
                >
                  {device === item.id && (
                    <motion.div
                      className="absolute inset-0 bg-primary/10 rounded-md"
                      layoutId="deviceIndicator"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className="w-4 h-4 relative z-10" />
                </Button>
              </motion.div>
            ))}
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="icon" onClick={handleRefresh}>
              <motion.div
                animate={isRefreshing ? { rotate: 360 } : {}}
                transition={{ duration: 1, ease: "linear" }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="ghost" size="sm">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button size="sm" className="gold-gradient text-primary-foreground relative overflow-hidden group">
              <motion.div
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
              <ExternalLink className="w-4 h-4 mr-2 relative z-10" />
              <span className="relative z-10">View Live</span>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Browser Frame */}
      <div className="h-[calc(100vh-3.5rem)] p-4 md:p-8 flex justify-center">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 25 }}
          style={{ width: deviceWidths[device], maxWidth: "100%" }}
          className="h-full rounded-xl border border-border/50 bg-white overflow-hidden shadow-2xl transition-all duration-500"
        >
          {/* Browser Chrome */}
          <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              {[
                { color: "bg-red-400", hoverColor: "hover:bg-red-500" },
                { color: "bg-yellow-400", hoverColor: "hover:bg-yellow-500" },
                { color: "bg-green-400", hoverColor: "hover:bg-green-500" },
              ].map((dot, i) => (
                <motion.div
                  key={i}
                  className={`w-3 h-3 rounded-full ${dot.color} ${dot.hoverColor} cursor-pointer transition-colors`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05, type: "spring" }}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
            <div className="flex-1 mx-4">
              <motion.div
                className="bg-white rounded-md px-3 py-1 text-sm text-gray-500 border border-gray-200 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.span
                  key={article.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="block truncate"
                >
                  techblog.argonote.com/blog/{article.title.toLowerCase().replace(/\s+/g, "-").slice(0, 30)}
                </motion.span>
              </motion.div>
            </div>
          </div>

          {/* WordPress Content */}
          <motion.div
            className="h-[calc(100%-2.5rem)] overflow-y-auto bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: isRefreshing ? 0.5 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* WordPress Header */}
            <header className="border-b border-gray-200">
              <div className="max-w-4xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-800 to-gray-600" />
                    <span className="font-bold text-gray-800">Tech Blog</span>
                  </div>
                  <nav className="hidden md:flex gap-6 text-sm text-gray-600">
                    <a href="#" className="hover:text-gray-900">Home</a>
                    <a href="#" className="hover:text-gray-900">Articles</a>
                    <a href="#" className="hover:text-gray-900">About</a>
                    <a href="#" className="hover:text-gray-900">Contact</a>
                  </nav>
                </div>
              </div>
            </header>

            {/* Article */}
            <article className="max-w-4xl mx-auto px-6 py-8">
              {/* Category */}
              <div className="mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {article.category || "Web Development"}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {article.title}
              </h1>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-300" />
                  <span>{article.author || "AI Writer"}</span>
                </div>
                <span>•</span>
                <span>{article.date || "January 25, 2024"}</span>
                <span>•</span>
                <span>8 min read</span>
              </div>

              {/* Featured Image */}
              <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-8 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Featured Image</span>
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">
                  Server Components represent a paradigm shift in how we build React applications.
                  With Next.js 14, migrating to Server Components has never been easier. This guide
                  will walk you through the entire process, from understanding the fundamentals to
                  implementing them in your existing project.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                  Why Migrate to Server Components?
                </h2>

                <p className="text-gray-700 leading-relaxed mb-6">
                  The benefits of Server Components are substantial. They offer reduced bundle size,
                  direct database access, improved SEO, and better performance overall.
                </p>

                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                  <li><strong>Reduced Bundle Size:</strong> Server Components don't add to your JavaScript bundle, resulting in faster page loads.</li>
                  <li><strong>Direct Database Access:</strong> Query your database directly from components without API routes.</li>
                  <li><strong>Improved SEO:</strong> Content is rendered on the server, making it immediately available to search engines.</li>
                  <li><strong>Better Performance:</strong> Reduced client-side JavaScript means faster Time to Interactive (TTI).</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                  Prerequisites and Setup
                </h2>

                <p className="text-gray-700 leading-relaxed mb-6">
                  Before we begin the migration, ensure you have Next.js 14 or later installed,
                  understanding of the App Router, and familiarity with async/await patterns.
                </p>

                <div className="bg-gray-900 rounded-lg p-4 mb-6 overflow-x-auto">
                  <code className="text-green-400 text-sm">
                    npx create-next-app@latest --typescript
                  </code>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  Continue reading to learn about the step-by-step migration process, common pitfalls,
                  and best practices for implementing Server Components in your application...
                </p>
              </div>

              {/* Tags */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {(article.tags || ["Next.js", "React", "Server Components", "Performance"]).map((tag, i) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      whileHover={{ scale: 1.05, backgroundColor: "#e5e7eb" }}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full cursor-pointer transition-colors"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Author Box */}
              <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-300 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">Written by AI Writer</p>
                    <p className="text-sm text-gray-600 mt-1">
                      AI-powered content generated by Argo Note. Our AI creates SEO-optimized
                      articles tailored to your niche and audience.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* WordPress Footer */}
            <footer className="border-t border-gray-200 mt-8">
              <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-gray-500">
                    © 2024 Tech Blog. Powered by Argo Note.
                  </p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <a href="#" className="hover:text-gray-700 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-gray-700 transition-colors">Terms</a>
                    <a href="#" className="hover:text-gray-700 transition-colors">RSS</a>
                  </div>
                </div>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
