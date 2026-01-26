"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Globe,
  Target,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Check,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OnboardingWizardProps {
  onComplete: () => void;
}

const steps = [
  {
    id: "welcome",
    title: "Your Blog is Ready!",
    subtitle: "Let's personalize your experience",
    icon: Sparkles,
  },
  {
    id: "niche",
    title: "Confirm Your Niche",
    subtitle: "We detected these topics from your website",
    icon: Target,
  },
  {
    id: "schedule",
    title: "Set Publishing Schedule",
    subtitle: "How often should we publish articles?",
    icon: Calendar,
  },
  {
    id: "topics",
    title: "First Content Ideas",
    subtitle: "We've prepared some article suggestions",
    icon: Lightbulb,
  },
];

const detectedTopics = [
  "Web Development",
  "React",
  "TypeScript",
  "Node.js",
  "JavaScript",
  "Frontend",
];

const scheduleOptions = [
  { label: "1x per week", value: "weekly", description: "Steady growth, less content" },
  { label: "2x per week", value: "biweekly", description: "Recommended for SEO" },
  { label: "Daily", value: "daily", description: "Maximum growth potential" },
];

const suggestedTopics = [
  {
    title: "Getting Started with Next.js 14 App Router",
    relevance: 95,
  },
  {
    title: "TypeScript Best Practices for React Developers",
    relevance: 92,
  },
  {
    title: "Building RESTful APIs with Node.js and Express",
    relevance: 88,
  },
  {
    title: "Modern CSS Techniques Every Developer Should Know",
    relevance: 85,
  },
];

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(detectedTopics);
  const [selectedSchedule, setSelectedSchedule] = useState("biweekly");
  const [selectedArticles, setSelectedArticles] = useState<string[]>([
    suggestedTopics[0].title,
    suggestedTopics[1].title,
  ]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  const toggleArticle = (title: string) => {
    setSelectedArticles((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 particle-bg" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-4">
        {/* Progress with animated connector */}
        <div className="flex justify-center items-center gap-2 mb-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                className={`rounded-full transition-all flex items-center justify-center ${
                  index < currentStep
                    ? "w-6 h-6 bg-primary"
                    : index === currentStep
                    ? "w-8 h-8 gold-gradient gold-glow-sm"
                    : "w-6 h-6 bg-muted-foreground/20"
                }`}
                animate={index === currentStep ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {index < currentStep && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </motion.div>
                )}
                {index === currentStep && (
                  <span className="text-xs font-bold text-primary-foreground">{index + 1}</span>
                )}
              </motion.div>
              {index < steps.length - 1 && (
                <motion.div
                  className="w-8 h-0.5 bg-muted-foreground/20 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: index < currentStep ? "100%" : "0%" }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <Card className="bg-card/90 backdrop-blur-xl border-primary/20">
          <CardContent className="p-8">
            {/* Step Header */}
            <div className="text-center mb-8">
              <motion.div
                key={currentStep}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex w-16 h-16 rounded-2xl gold-gradient items-center justify-center mb-4 gold-glow"
              >
                <StepIcon className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              <motion.h2
                key={`title-${currentStep}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-foreground mb-2"
              >
                {currentStepData.title}
              </motion.h2>
              <motion.p
                key={`subtitle-${currentStep}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground"
              >
                {currentStepData.subtitle}
              </motion.p>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="min-h-[200px]"
              >
                {/* Welcome Step */}
                {currentStep === 0 && (
                  <div className="text-center space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: "WordPress", value: "Ready", icon: Globe },
                        { label: "Keywords", value: "24", icon: Target },
                        { label: "Articles Planned", value: "12", icon: Calendar },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="p-4 rounded-lg bg-secondary/30 border border-border/50"
                        >
                          <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                          <p className="text-lg font-bold gold-text-gradient">
                            {stat.value}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your blog is live at{" "}
                      <span className="text-primary">techblog.argonote.com</span>
                    </p>
                  </div>
                )}

                {/* Niche Step */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {detectedTopics.map((topic, index) => (
                        <motion.button
                          key={topic}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05, type: "spring" }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleTopic(topic)}
                          className={`px-4 py-2 rounded-full border transition-all relative overflow-hidden ${
                            selectedTopics.includes(topic)
                              ? "bg-primary/20 border-primary text-primary"
                              : "bg-secondary/30 border-border/50 text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {/* Selection glow */}
                          {selectedTopics.includes(topic) && (
                            <motion.div
                              className="absolute inset-0 bg-primary/10"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            />
                          )}
                          <span className="relative z-10 flex items-center">
                            <AnimatePresence mode="wait">
                              {selectedTopics.includes(topic) && (
                                <motion.span
                                  initial={{ scale: 0, width: 0 }}
                                  animate={{ scale: 1, width: "auto" }}
                                  exit={{ scale: 0, width: 0 }}
                                  className="mr-2"
                                >
                                  <Check className="w-4 h-4" />
                                </motion.span>
                              )}
                            </AnimatePresence>
                            {topic}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                    <motion.div
                      className="pt-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Label className="text-sm text-muted-foreground">
                        Add custom topic
                      </Label>
                      <Input
                        placeholder="e.g., Machine Learning, DevOps..."
                        className="mt-2 bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                      />
                    </motion.div>
                  </div>
                )}

                {/* Schedule Step */}
                {currentStep === 2 && (
                  <div className="space-y-3">
                    {scheduleOptions.map((option, index) => (
                      <motion.button
                        key={option.value}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedSchedule(option.value)}
                        className={`w-full p-4 rounded-lg border text-left transition-all relative overflow-hidden ${
                          selectedSchedule === option.value
                            ? "bg-primary/10 border-primary"
                            : "bg-secondary/30 border-border/50 hover:border-primary/50"
                        }`}
                      >
                        {/* Selected glow */}
                        {selectedSchedule === option.value && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                        )}
                        {/* Recommended badge */}
                        {option.value === "biweekly" && (
                          <motion.span
                            className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            Recommended
                          </motion.span>
                        )}
                        <div className="relative z-10 flex items-center justify-between">
                          <div>
                            <p className={`font-medium transition-colors ${
                              selectedSchedule === option.value ? "text-primary" : "text-foreground"
                            }`}>
                              {option.label}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                          <motion.div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedSchedule === option.value
                                ? "bg-primary border-primary"
                                : "border-border/50"
                            }`}
                            animate={selectedSchedule === option.value ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            <AnimatePresence>
                              {selectedSchedule === option.value && (
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
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Topics Step */}
                {currentStep === 3 && (
                  <div className="space-y-3">
                    <motion.p
                      className="text-sm text-muted-foreground text-center mb-4"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      Select articles to generate first (you can add more later)
                    </motion.p>
                    {suggestedTopics.map((topic, index) => (
                      <motion.button
                        key={topic.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleArticle(topic.title)}
                        className={`w-full p-4 rounded-lg border text-left transition-all relative overflow-hidden ${
                          selectedArticles.includes(topic.title)
                            ? "bg-primary/10 border-primary"
                            : "bg-secondary/30 border-border/50 hover:border-primary/50"
                        }`}
                      >
                        {/* Selection glow */}
                        {selectedArticles.includes(topic.title) && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                        )}
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex-1">
                            <p className={`font-medium transition-colors ${
                              selectedArticles.includes(topic.title) ? "text-primary" : "text-foreground"
                            }`}>
                              {topic.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-primary/60 to-primary"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${topic.relevance}%` }}
                                  transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {topic.relevance}% match
                              </span>
                            </div>
                          </div>
                          <motion.div
                            className={`ml-4 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedArticles.includes(topic.title)
                                ? "bg-primary border-primary"
                                : "border-border/50"
                            }`}
                            animate={selectedArticles.includes(topic.title) ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            <AnimatePresence>
                              {selectedArticles.includes(topic.title) && (
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
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <motion.div
                    animate={{ x: [0, -3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  </motion.div>
                  Back
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleNext}
                  className="gold-gradient text-primary-foreground gold-glow relative overflow-hidden group"
                >
                  {/* Button shine effect */}
                  <motion.div
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  {currentStep === steps.length - 1 ? (
                    <span className="relative z-10 flex items-center">
                      Go to Dashboard
                      <motion.div
                        className="ml-2"
                        animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center">
                      Continue
                      <motion.div
                        className="ml-2"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </span>
                  )}
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
