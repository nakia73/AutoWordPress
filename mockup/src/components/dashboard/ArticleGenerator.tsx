"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Search,
  FileText,
  CheckCircle,
  Loader2,
  ArrowRight,
  Eye,
  Edit3,
  Send,
  X,
  BookOpen,
  Target,
  Newspaper,
  Zap,
  Brain,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";

// Typewriter effect component
function TypewriterText({ text, speed = 30 }: { text: string; speed?: number }) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return (
    <span>
      {displayText}
      {currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-2 h-4 bg-primary ml-0.5"
        />
      )}
    </span>
  );
}

// Animated word counter component
function WordCounter({ target, duration }: { target: number; duration: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * target));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return <span className="font-bold text-primary">{count.toLocaleString()}</span>;
}

interface ArticleGeneratorProps {
  suggestion?: {
    title: string;
    keyword: string;
  };
  onClose: () => void;
  onComplete: () => void;
}

const generationSteps = [
  {
    id: "research",
    label: "Researching Topic",
    description: "Analyzing top-ranking content and gathering insights...",
    icon: Search,
    duration: 4000,
  },
  {
    id: "outline",
    label: "Creating Outline",
    description: "Structuring the article for maximum engagement...",
    icon: FileText,
    duration: 3000,
  },
  {
    id: "writing",
    label: "Writing Content",
    description: "Generating SEO-optimized paragraphs...",
    icon: Edit3,
    duration: 6000,
  },
  {
    id: "optimizing",
    label: "SEO Optimization",
    description: "Adding meta tags, headings, and internal links...",
    icon: Target,
    duration: 3000,
  },
  {
    id: "complete",
    label: "Article Ready",
    description: "Your article is ready for review!",
    icon: CheckCircle,
    duration: 0,
  },
];

const mockArticleContent = {
  title: "Next.js 14 Server Components: A Complete Migration Guide",
  metaDescription:
    "Learn how to migrate your Next.js application to Server Components with this comprehensive step-by-step guide. Improve performance and reduce bundle size.",
  outline: [
    "Introduction to Server Components",
    "Why Migrate to Server Components?",
    "Prerequisites and Setup",
    "Step-by-Step Migration Process",
    "Common Pitfalls and Solutions",
    "Performance Benefits",
    "Conclusion and Next Steps",
  ],
  wordCount: 2847,
  readTime: "12 min",
  keywords: ["next.js", "server components", "react", "migration", "performance"],
  preview: `
# Next.js 14 Server Components: A Complete Migration Guide

Server Components represent a paradigm shift in how we build React applications. With Next.js 14, migrating to Server Components has never been easier. This guide will walk you through the entire process, from understanding the fundamentals to implementing them in your existing project.

## Why Migrate to Server Components?

The benefits of Server Components are substantial:

- **Reduced Bundle Size**: Server Components don't add to your JavaScript bundle, resulting in faster page loads.
- **Direct Database Access**: Query your database directly from components without API routes.
- **Improved SEO**: Content is rendered on the server, making it immediately available to search engines.
- **Better Performance**: Reduced client-side JavaScript means faster Time to Interactive (TTI).

## Prerequisites and Setup

Before we begin the migration, ensure you have:

1. Next.js 14 or later installed
2. Understanding of the App Router
3. Familiarity with async/await patterns

\`\`\`bash
npx create-next-app@latest --typescript
\`\`\`

## Step-by-Step Migration Process

### Step 1: Identify Component Types

First, audit your existing components and categorize them:

- **Server Components**: Data fetching, database queries, sensitive operations
- **Client Components**: Interactive elements, state management, browser APIs

### Step 2: Update Your Components

...
  `,
};

export default function ArticleGenerator({
  suggestion,
  onClose,
  onComplete,
}: ArticleGeneratorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const toast = useToast();

  useEffect(() => {
    if (currentStep >= generationSteps.length - 1) {
      setIsComplete(true);
      toast.success("Article Generated!", "Your article is ready for review and publishing.");
      return;
    }

    const step = generationSteps[currentStep];

    // Progress animation
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const stepProgress = ((currentStep + 1) / (generationSteps.length - 1)) * 100;
        const increment = 100 / (step.duration / 100);
        return Math.min(prev + increment, stepProgress);
      });
    }, 100);

    // Move to next step
    const stepTimer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, step.duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(stepTimer);
    };
  }, [currentStep]);

  const currentStepData = generationSteps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      {/* Completion celebration particles */}
      <AnimatePresence>
        {isComplete && (
          <>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: i % 2 === 0 ? "#d4af37" : "#ffd700",
                  left: "50%",
                  top: "50%",
                }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.02,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <Card className="bg-card border-primary/20 relative overflow-hidden">
          {/* Modal shimmer effect */}
          <motion.div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/5 to-transparent pointer-events-none"
            animate={{ translateX: ["100%", "-100%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          <CardContent className="p-0">
            {/* Header */}
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center gold-glow-sm">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">
                    {isComplete ? "Article Generated!" : "Generating Article"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {suggestion?.title || mockArticleContent.title}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6">
              {!isComplete ? (
                /* Generation Progress */
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-primary font-medium">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Steps */}
                  <div className="space-y-4">
                    {generationSteps.slice(0, -1).map((step, index) => {
                      const Icon = step.icon;
                      const isActive = index === currentStep;
                      const isCompleted = index < currentStep;

                      return (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`relative flex items-center gap-4 p-4 rounded-lg transition-all overflow-hidden ${
                            isActive
                              ? "bg-primary/10 border border-primary/30"
                              : isCompleted
                              ? "bg-green-500/5 border border-green-500/20"
                              : "bg-secondary/30 border border-transparent"
                          }`}
                        >
                          {/* Active step shimmer */}
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                              animate={{ translateX: ["100%", "-100%"] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                          {/* Completed checkmark burst */}
                          <AnimatePresence>
                            {isCompleted && index === currentStep - 1 && (
                              <motion.div
                                className="absolute inset-0 bg-green-500/10"
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: 2, opacity: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                              />
                            )}
                          </AnimatePresence>
                          <motion.div
                            className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                              isActive
                                ? "bg-primary/20 text-primary"
                                : isCompleted
                                ? "bg-green-500/20 text-green-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                            animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                            transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                          >
                            {isCompleted ? (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 500 }}
                              >
                                <CheckCircle className="w-5 h-5" />
                              </motion.div>
                            ) : isActive ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Icon className="w-5 h-5" />
                            )}
                          </motion.div>
                          <div className="flex-1 relative z-10">
                            <p
                              className={`font-medium ${
                                isActive
                                  ? "text-primary"
                                  : isCompleted
                                  ? "text-green-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {step.label}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {step.description}
                            </p>
                          </div>
                          {isActive && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                            >
                              <Badge className="bg-primary/20 text-primary border-primary/30 relative z-10">
                                <motion.span
                                  className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1.5"
                                  animate={{ opacity: [1, 0.3, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                />
                                In Progress
                              </Badge>
                            </motion.div>
                          )}
                          {isCompleted && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                            >
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 relative z-10">
                                Complete
                              </Badge>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Live Output Terminal */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 rounded-lg bg-black/80 border border-primary/20 overflow-hidden"
                  >
                    {/* Terminal Header */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-black/50 border-b border-border/30">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                      </div>
                      <span className="text-xs text-muted-foreground ml-2 flex items-center gap-2">
                        <Brain className="w-3 h-3 text-primary" />
                        AI Processing
                        <motion.span
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          ●
                        </motion.span>
                      </span>
                    </div>
                    {/* Terminal Content */}
                    <div className="p-4 font-mono text-xs max-h-36 overflow-y-auto space-y-1">
                      <AnimatePresence mode="wait">
                        {currentStep === 0 && (
                          <motion.div
                            key="step-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-1"
                          >
                            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-green-400">
                              <span className="text-blue-400">[INFO]</span> Initializing research module...
                            </motion.p>
                            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="text-green-400">
                              <span className="text-blue-400">[SCAN]</span> Fetching top 10 ranking articles...
                            </motion.p>
                            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="text-green-400">
                              <span className="text-yellow-400">[PROC]</span> Extracting key topics and subtopics...
                            </motion.p>
                            <motion.p
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.9 }}
                              className="text-primary"
                            >
                              <span className="text-primary">[AI]</span> <TypewriterText text="Analyzing competitor content structure..." speed={40} />
                            </motion.p>
                          </motion.div>
                        )}
                        {currentStep === 1 && (
                          <motion.div
                            key="step-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-1"
                          >
                            <p className="text-green-400"><span className="text-green-500">[DONE]</span> ✓ Research complete: 10 sources analyzed</p>
                            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-green-400">
                              <span className="text-blue-400">[GEN]</span> Generating article outline...
                            </motion.p>
                            <motion.p
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 }}
                              className="text-primary"
                            >
                              <span className="text-primary">[AI]</span> <TypewriterText text="Creating 7 main sections with SEO optimization..." speed={35} />
                            </motion.p>
                          </motion.div>
                        )}
                        {currentStep === 2 && (
                          <motion.div
                            key="step-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-1"
                          >
                            <p className="text-green-400"><span className="text-green-500">[DONE]</span> ✓ Outline created: 7 sections</p>
                            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-green-400">
                              <span className="text-blue-400">[WRITE]</span> Writing introduction...
                            </motion.p>
                            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="text-green-400">
                              <span className="text-yellow-400">[PROC]</span> Generating body paragraphs...
                            </motion.p>
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 }}
                              className="text-primary flex items-center gap-2"
                            >
                              <span className="text-primary">[AI]</span>
                              <span>Word count:</span>
                              <motion.span
                                key="word-count"
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                              >
                                <WordCounter target={2847} duration={5000} />
                              </motion.span>
                              <span className="text-muted-foreground">/ 2,500 target</span>
                            </motion.div>
                          </motion.div>
                        )}
                        {currentStep === 3 && (
                          <motion.div
                            key="step-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-1"
                          >
                            <p className="text-green-400"><span className="text-green-500">[DONE]</span> ✓ Content written: 2,847 words</p>
                            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-green-400">
                              <span className="text-yellow-400">[SEO]</span> Adding meta description...
                            </motion.p>
                            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="text-green-400">
                              <span className="text-yellow-400">[SEO]</span> Optimizing headings for SEO...
                            </motion.p>
                            <motion.p
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 }}
                              className="text-primary"
                            >
                              <span className="text-primary">[AI]</span> <TypewriterText text="Inserting internal links and finalizing..." speed={35} />
                            </motion.p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>
              ) : (
                /* Completed - Show Preview */
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: "Words", value: mockArticleContent.wordCount.toLocaleString(), numValue: mockArticleContent.wordCount },
                      { label: "Read Time", value: mockArticleContent.readTime, numValue: 12 },
                      { label: "Keywords", value: mockArticleContent.keywords.length.toString(), numValue: mockArticleContent.keywords.length },
                      { label: "Sections", value: mockArticleContent.outline.length.toString(), numValue: mockArticleContent.outline.length },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="p-4 rounded-lg bg-secondary/30 border border-border/50 text-center relative overflow-hidden group cursor-pointer"
                      >
                        {/* Hover glow */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                        <motion.p
                          className="text-2xl font-bold gold-text-gradient relative z-10"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 400 }}
                        >
                          {stat.label === "Read Time" ? stat.value : <WordCounter target={stat.numValue} duration={1000} />}
                          {stat.label === "Read Time" ? "" : stat.label === "Words" ? "" : ""}
                        </motion.p>
                        <p className="text-xs text-muted-foreground relative z-10">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Tabs */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="bg-secondary/50 relative">
                        {["preview", "outline", "seo"].map((tab) => (
                          <TabsTrigger
                            key={tab}
                            value={tab}
                            className="relative z-10"
                          >
                            {tab === "preview" && <Eye className="w-4 h-4 mr-2" />}
                            {tab === "outline" && <BookOpen className="w-4 h-4 mr-2" />}
                            {tab === "seo" && <Target className="w-4 h-4 mr-2" />}
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      <AnimatePresence mode="wait">
                        <TabsContent value="preview" className="mt-4">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 rounded-lg bg-secondary/30 border border-border/50 max-h-64 overflow-y-auto"
                          >
                            <article className="prose prose-invert prose-sm max-w-none">
                              <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                                {mockArticleContent.preview}
                              </pre>
                            </article>
                          </motion.div>
                        </TabsContent>

                        <TabsContent value="outline" className="mt-4">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 rounded-lg bg-secondary/30 border border-border/50"
                          >
                            <ul className="space-y-2">
                              {mockArticleContent.outline.map((section, i) => (
                                <motion.li
                                  key={i}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  whileHover={{ x: 4 }}
                                  className="flex items-center gap-3 cursor-pointer group"
                                >
                                  <motion.span
                                    className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center group-hover:bg-primary/30 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    {i + 1}
                                  </motion.span>
                                  <span className="text-foreground group-hover:text-primary transition-colors">{section}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </motion.div>
                        </TabsContent>

                        <TabsContent value="seo" className="mt-4">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                          >
                            <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                                Meta Description
                              </p>
                              <p className="text-sm text-foreground">
                                {mockArticleContent.metaDescription}
                              </p>
                            </div>
                            <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                                Target Keywords
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {mockArticleContent.keywords.map((keyword, i) => (
                                  <motion.div
                                    key={keyword}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    <Badge
                                      variant="outline"
                                      className="bg-primary/10 text-primary border-primary/30 cursor-pointer hover:bg-primary/20 transition-colors"
                                    >
                                      {keyword}
                                    </Badge>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        </TabsContent>
                      </AnimatePresence>
                    </Tabs>
                  </motion.div>

                  {/* Actions */}
                  <motion.div
                    className="flex gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" className="w-full border-border/50 hover:border-primary/30 transition-colors group">
                        <motion.div
                          whileHover={{ rotate: -15 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Edit3 className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
                        </motion.div>
                        Edit Article
                      </Button>
                    </motion.div>
                    <motion.div
                      className="flex-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        className="w-full gold-gradient text-primary-foreground gold-glow relative overflow-hidden group"
                        onClick={onComplete}
                      >
                        {/* Button shimmer */}
                        <motion.div
                          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ translateX: ["100%", "-100%"] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        />
                        <motion.div
                          className="relative z-10 flex items-center justify-center"
                          whileHover={{ x: 4 }}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Publish to WordPress
                        </motion.div>
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
