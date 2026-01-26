"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Globe, Zap, Target, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HeroProps {
  onStartDemo: (url: string) => void;
}

const niches = [
  "Tech & Development",
  "SaaS & Startups",
  "AI & Machine Learning",
  "Marketing & Growth",
  "E-commerce",
  "Finance & Fintech",
  "Health & Wellness",
  "Other",
];

export default function Hero({ onStartDemo }: HeroProps) {
  const [url, setUrl] = useState("");
  const [niche, setNiche] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartDemo(url || "https://example.com");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 particle-bg" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-8 cursor-default relative overflow-hidden"
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/20 to-transparent"
            animate={{ translateX: ["100%", "-100%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-primary relative z-10" />
          </motion.div>
          <span className="text-sm text-primary relative z-10">
            The Future of Blog Automation
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
        >
          <span className="text-foreground">Your AI-Powered Blog.</span>
          <br />
          <span className="gold-text-shimmer">
            Fully Automated.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
        >
          Enter your website URL. We&apos;ll analyze your niche, build your WordPress blog,
          and automatically generate SEO-optimized content. Zero effort. Maximum impact.
        </motion.p>

        {/* URL Input Form */}
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto mb-8"
        >
          <motion.div
            className="p-6 rounded-2xl border border-primary/20 bg-card/30 backdrop-blur-sm relative overflow-hidden"
            whileHover={{ borderColor: "rgba(212, 175, 55, 0.4)" }}
            transition={{ duration: 0.3 }}
          >
            {/* Subtle glow on focus */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0"
              whileHover={{ opacity: 1 }}
            />
            {/* Main Input */}
            <div className="relative z-10 flex flex-col sm:flex-row gap-3 mb-4">
              <motion.div
                className="relative flex-1 group"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div
                  animate={url ? { scale: 1.1, color: "#D4AF37" } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </motion.div>
                <Input
                  type="url"
                  placeholder="https://your-website.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-12 h-14 text-lg bg-secondary/50 border-primary/20 focus:border-primary focus:ring-primary transition-all"
                />
                {/* Input focus glow */}
                <div className="absolute inset-0 rounded-lg bg-primary/10 opacity-0 group-focus-within:opacity-100 blur-xl -z-10 transition-opacity" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  size="lg"
                  className="h-14 px-8 gold-gradient text-primary-foreground font-semibold gold-glow group relative overflow-hidden"
                >
                  {/* Button shine effect */}
                  <motion.div
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  <span className="relative z-10">Start Building</span>
                  <motion.div
                    className="relative z-10 ml-2"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Button>
              </motion.div>
            </div>

            {/* Advanced Options Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
            >
              <span>Additional options</span>
              <motion.div animate={{ rotate: showAdvanced ? 180 : 0 }}>
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </button>

            {/* Advanced Options */}
            <motion.div
              initial={false}
              animate={{
                height: showAdvanced ? "auto" : 0,
                opacity: showAdvanced ? 1 : 0,
              }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-border/50">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="text-left">
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      Blog Niche
                    </Label>
                    <select
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className="w-full h-12 px-4 rounded-lg bg-secondary/50 border border-primary/20 text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="">Auto-detect from URL</option>
                      {niches.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-left">
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      Target Keywords (optional)
                    </Label>
                    <Input
                      placeholder="e.g., react, typescript, nextjs"
                      className="h-12 bg-secondary/50 border-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.form>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          {[
            { icon: Zap, text: "Setup in 60 seconds" },
            { icon: Sparkles, text: "AI-Generated Content" },
            { icon: Globe, text: "WordPress Included" },
          ].map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.05, color: "#D4AF37" }}
              className="flex items-center gap-2 cursor-default"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
              >
                <item.icon className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="transition-colors">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-16 relative"
        >
          <motion.div
            className="absolute inset-0 gold-glow opacity-30 blur-2xl"
            animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="relative rounded-xl border border-primary/20 bg-card/50 backdrop-blur-sm p-2 shadow-2xl"
            whileHover={{ scale: 1.01, borderColor: "rgba(212, 175, 55, 0.4)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="rounded-lg bg-card overflow-hidden">
              {/* Mock Dashboard Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
                {[
                  "bg-red-500/80",
                  "bg-yellow-500/80",
                  "bg-green-500/80",
                ].map((color, i) => (
                  <motion.div
                    key={i}
                    className={`w-3 h-3 rounded-full ${color}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.2 + i * 0.1 }}
                    whileHover={{ scale: 1.3 }}
                  />
                ))}
                <motion.span
                  className="ml-4 text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  dashboard.argonote.com
                </motion.span>
              </div>
              {/* Mock Dashboard Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">My Tech Blog</h3>
                    <p className="text-sm text-muted-foreground">12 articles generated</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.span
                      className="relative px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.span
                        className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-green-400"
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      Active
                    </motion.span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Total Views", value: "12.4K" },
                    { label: "Articles", value: "12" },
                    { label: "Keywords", value: "48" },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.3 + index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="p-4 rounded-lg bg-secondary/50 border border-border/50 hover:border-primary/30 transition-colors cursor-default"
                    >
                      <p className="text-2xl font-bold gold-text-gradient">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
