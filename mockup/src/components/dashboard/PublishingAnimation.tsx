"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Image,
  Search,
  Link2,
  CheckCircle,
  Loader2,
  Sparkles,
  Globe,
  Rocket,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Pre-generate particle positions to avoid Math.random during render
const generateParticlePositions = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 500,
    y: (Math.random() - 0.5) * 500,
    color: i % 3 === 0 ? "#d4af37" : i % 3 === 1 ? "#ffd700" : "#22c55e",
    delay: i * 0.02,
  }));
};

const PARTICLE_POSITIONS = generateParticlePositions(30);

interface PublishingAnimationProps {
  article: {
    title: string;
  };
  onComplete: () => void;
}

const publishingSteps = [
  {
    id: "upload",
    label: "Uploading to WordPress",
    description: "Transferring article content to your blog...",
    icon: Upload,
    duration: 2500,
  },
  {
    id: "media",
    label: "Processing Media",
    description: "Optimizing images for web performance...",
    icon: Image,
    duration: 2000,
  },
  {
    id: "seo",
    label: "Applying SEO Settings",
    description: "Configuring meta tags and structured data...",
    icon: Search,
    duration: 2000,
  },
  {
    id: "links",
    label: "Generating Internal Links",
    description: "Creating connections to related content...",
    icon: Link2,
    duration: 1500,
  },
  {
    id: "deploy",
    label: "Publishing Live",
    description: "Making your article available to the world...",
    icon: Globe,
    duration: 2000,
  },
  {
    id: "complete",
    label: "Published Successfully!",
    description: "Your article is now live on your blog.",
    icon: CheckCircle,
    duration: 0,
  },
];

export default function PublishingAnimation({
  article,
  onComplete,
}: PublishingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentStep >= publishingSteps.length - 1) {
      setIsComplete(true);
      setProgress(100);
      // Auto-proceed after completion animation
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }

    const step = publishingSteps[currentStep];

    // Progress animation
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const stepProgress = ((currentStep + 1) / (publishingSteps.length - 1)) * 100;
        const increment = 100 / (step.duration / 50);
        return Math.min(prev + increment, stepProgress);
      });
    }, 50);

    // Move to next step
    const stepTimer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, step.duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(stepTimer);
    };
  }, [currentStep, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4"
    >
      {/* Success particles */}
      <AnimatePresence>
        {isComplete && (
          <>
            {PARTICLE_POSITIONS.map((particle) => (
              <motion.div
                key={`particle-${particle.id}`}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: particle.color,
                  left: "50%",
                  top: "50%",
                }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: particle.x,
                  y: particle.y,
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: particle.delay,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-lg"
      >
        <Card className="bg-card border-primary/20 relative overflow-hidden">
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.3), transparent 70%)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          <CardContent className="p-8 relative z-10">
            {/* Header Icon */}
            <motion.div
              className="flex justify-center mb-6"
              animate={isComplete ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                  isComplete
                    ? "bg-green-500/20 border-2 border-green-500/50"
                    : "gold-gradient gold-glow"
                }`}
                animate={!isComplete ? { rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 2, repeat: isComplete ? 0 : Infinity }}
              >
                {isComplete ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </motion.div>
                ) : (
                  <Rocket className="w-10 h-10 text-primary-foreground" />
                )}
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground mb-2">
                {isComplete ? "Article Published!" : "Publishing Article..."}
              </h2>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {article.title}
              </p>
            </motion.div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-primary font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {publishingSteps.slice(0, -1).map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-primary/10 border border-primary/30"
                        : isCompleted
                        ? "bg-green-500/5"
                        : "bg-secondary/30"
                    }`}
                  >
                    <motion.div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? "bg-primary/20 text-primary"
                          : isCompleted
                          ? "bg-green-500/20 text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : isActive ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          isActive
                            ? "text-primary"
                            : isCompleted
                            ? "text-green-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                      {isActive && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-xs text-muted-foreground"
                        >
                          {step.description}
                        </motion.p>
                      )}
                    </div>
                    {isCompleted && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-xs text-green-400"
                      >
                        Done
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Success message */}
            <AnimatePresence>
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium">Opening WordPress Admin...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
