"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Search,
  FileText,
  Database,
  Cpu,
  Sparkles,
  Check,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface SetupAnimationProps {
  url: string;
  onComplete: () => void;
}

const steps = [
  {
    id: "analyzing",
    icon: Search,
    title: "Analyzing Your Website",
    description: "Scanning your content and identifying your niche...",
    duration: 3000,
    details: [
      "Fetching page content",
      "Extracting keywords",
      "Identifying target audience",
      "Analyzing competitors",
    ],
  },
  {
    id: "wordpress",
    icon: Globe,
    title: "Setting Up WordPress",
    description: "Provisioning your fully-managed blog...",
    duration: 4000,
    details: [
      "Creating WordPress instance",
      "Installing premium theme",
      "Configuring SSL certificate",
      "Setting up CDN",
    ],
  },
  {
    id: "seo",
    icon: Database,
    title: "Configuring SEO",
    description: "Optimizing your blog for search engines...",
    duration: 3000,
    details: [
      "Installing Yoast SEO",
      "Generating sitemap",
      "Setting meta tags",
      "Configuring schema markup",
    ],
  },
  {
    id: "content",
    icon: FileText,
    title: "Generating Content Plan",
    description: "Creating your personalized content strategy...",
    duration: 3500,
    details: [
      "Researching trending topics",
      "Analyzing search intent",
      "Creating content calendar",
      "Prioritizing keywords",
    ],
  },
  {
    id: "ai",
    icon: Cpu,
    title: "Training AI on Your Niche",
    description: "Calibrating AI models for your specific audience...",
    duration: 3000,
    details: [
      "Loading niche data",
      "Configuring tone of voice",
      "Setting brand guidelines",
      "Finalizing AI parameters",
    ],
  },
  {
    id: "complete",
    icon: Sparkles,
    title: "Your Blog is Ready!",
    description: "Everything is set up and ready to go.",
    duration: 0,
    details: [],
  },
];

export default function SetupAnimation({ url, onComplete }: SetupAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentDetail, setCurrentDetail] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentStep >= steps.length - 1) {
      setIsComplete(true);
      return;
    }

    const step = steps[currentStep];
    const detailInterval = step.duration / (step.details.length + 1);

    // Progress animation
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const stepProgress = ((currentStep + 1) / (steps.length - 1)) * 100;
        const stepStart = (currentStep / (steps.length - 1)) * 100;
        const increment = (stepProgress - stepStart) / (step.duration / 100);
        return Math.min(prev + increment, stepProgress);
      });
    }, 100);

    // Detail cycling
    const detailTimer = setInterval(() => {
      setCurrentDetail((prev) => {
        if (prev >= step.details.length - 1) return prev;
        return prev + 1;
      });
    }, detailInterval);

    // Move to next step
    const stepTimer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
      setCurrentDetail(0);
    }, step.duration);

    return () => {
      clearInterval(progressTimer);
      clearInterval(detailTimer);
      clearTimeout(stepTimer);
    };
  }, [currentStep]);

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 particle-bg" />
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Floating Particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/40 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -50, 0],
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}

      <div className="relative z-10 max-w-2xl w-full mx-4">
        {/* URL Display */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-sm text-muted-foreground mb-2">Setting up for</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-primary/20">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-foreground font-medium">{url}</span>
          </div>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30 rounded-2xl blur-xl opacity-50" />

          <div className="relative rounded-2xl border border-primary/30 bg-card/90 backdrop-blur-xl p-8">
            {/* Step Icon with orbiting particles */}
            <div className="flex justify-center mb-6">
              <motion.div
                key={currentStep}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="relative"
              >
                {/* Orbiting particles */}
                {!isComplete && [...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-primary"
                    style={{
                      left: "50%",
                      top: "50%",
                    }}
                    animate={{
                      x: Math.cos((i * 60 + Date.now() / 20) * Math.PI / 180) * 50,
                      y: Math.sin((i * 60 + Date.now() / 20) * Math.PI / 180) * 50,
                      scale: [0.5, 1, 0.5],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "linear",
                    }}
                  />
                ))}
                {/* Pulsing ring */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-primary/50"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ margin: "-8px" }}
                />
                <div className="absolute inset-0 blur-xl bg-primary/40" />
                <motion.div
                  className="relative w-20 h-20 rounded-2xl gold-gradient flex items-center justify-center gold-glow overflow-hidden"
                  animate={isComplete ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                  {isComplete ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <Check className="w-10 h-10 text-primary-foreground" />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <StepIcon className="w-10 h-10 text-primary-foreground" />
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </div>

            {/* Step Title & Description */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center mb-8"
              >
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {isComplete ? (
                    <span className="gold-text-gradient">{currentStepData.title}</span>
                  ) : (
                    currentStepData.title
                  )}
                </h2>
                <p className="text-muted-foreground">{currentStepData.description}</p>
              </motion.div>
            </AnimatePresence>

            {!isComplete && (
              <>
                {/* Progress Bar */}
                <div className="mb-6">
                  <Progress value={progress} className="h-2 bg-secondary" />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Step {currentStep + 1} of {steps.length - 1}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                </div>

                {/* Detail Animation */}
                <div className="min-h-[120px] p-4 rounded-lg bg-secondary/30 border border-border/50">
                  <div className="space-y-3">
                    {currentStepData.details.map((detail, index) => (
                      <motion.div
                        key={detail}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                          opacity: index <= currentDetail ? 1 : 0.3,
                          x: 0,
                        }}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                            index < currentDetail
                              ? "bg-green-500/20 text-green-400"
                              : index === currentDetail
                              ? "bg-primary/20 text-primary"
                              : "bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          {index < currentDetail ? (
                            <Check className="w-3 h-3" />
                          ) : index === currentDetail ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            index <= currentDetail
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {detail}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Terminal-style Log */}
                <div className="mt-6 p-3 rounded-lg bg-black/50 border border-border/30 font-mono text-xs">
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <span className="text-green-400">$</span>
                    <span>argo-note init --url={url}</span>
                  </div>
                  <motion.div
                    key={`${currentStep}-${currentDetail}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-primary/80"
                  >
                    {currentStepData.details[currentDetail] && (
                      <span>→ {currentStepData.details[currentDetail]}...</span>
                    )}
                  </motion.div>
                </div>
              </>
            )}

            {/* Complete State */}
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 relative"
              >
                {/* Celebration particles */}
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      left: "50%",
                      top: "-20px",
                      backgroundColor: i % 4 === 0 ? "#D4AF37" : i % 4 === 1 ? "#4ade80" : i % 4 === 2 ? "#60a5fa" : "#f472b6",
                    }}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      x: (Math.random() - 0.5) * 300,
                      y: Math.random() * 150 + 50,
                      rotate: Math.random() * 360,
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.05,
                      ease: "easeOut",
                    }}
                  />
                ))}

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "WordPress", value: "Ready", icon: "✓" },
                    { label: "Keywords", value: "24", icon: "🎯" },
                    { label: "Articles Planned", value: "12", icon: "📝" },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                      whileHover={{ scale: 1.05, y: -4 }}
                      className="relative p-4 rounded-lg bg-secondary/50 border border-border/50 text-center overflow-hidden group cursor-pointer"
                    >
                      {/* Hover glow */}
                      <motion.div
                        className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                      <motion.p
                        className="text-2xl font-bold gold-text-gradient relative z-10"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.1, type: "spring" }}
                      >
                        {stat.value}
                      </motion.p>
                      <p className="text-xs text-muted-foreground relative z-10">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Success message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center"
                >
                  <p className="text-green-400 text-sm font-medium flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ✨
                    </motion.span>
                    Your blog is configured and ready to generate content!
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                    >
                      ✨
                    </motion.span>
                  </p>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={onComplete}
                    size="lg"
                    className="w-full h-14 gold-gradient text-primary-foreground font-semibold text-lg gold-glow group relative overflow-hidden"
                  >
                    {/* Button shine */}
                    <motion.div
                      className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                    <span className="relative z-10">Go to Dashboard</span>
                    <motion.div
                      className="relative z-10 ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Step Indicators */}
        {!isComplete && (
          <div className="flex justify-center gap-2 mt-8">
            {steps.slice(0, -1).map((step, index) => (
              <motion.div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index < currentStep
                    ? "bg-primary"
                    : index === currentStep
                    ? "bg-primary animate-pulse"
                    : "bg-muted-foreground/30"
                }`}
                animate={index === currentStep ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
