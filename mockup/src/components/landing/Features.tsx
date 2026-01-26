"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Globe,
  Zap,
  RefreshCw,
  BarChart3,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "WordPress Auto-Setup",
    description:
      "We provision and configure your entire WordPress blog. Hosting, theme, plugins - all handled automatically.",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Sparkles,
    title: "AI Content Generation",
    description:
      "Our AI analyzes your niche and creates SEO-optimized articles that actually rank. Powered by Claude & GPT-4.",
    gradient: "from-primary/20 to-yellow-500/20",
  },
  {
    icon: RefreshCw,
    title: "Automated Publishing",
    description:
      "Set your schedule and forget. Articles are researched, written, and published automatically every week.",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: Zap,
    title: "60-Second Onboarding",
    description:
      "Enter your URL, confirm your niche, and you're done. Your first article will be live within hours.",
    gradient: "from-orange-500/20 to-red-500/20",
  },
  {
    icon: BarChart3,
    title: "Performance Dashboard",
    description:
      "Track your blog's growth with real-time analytics. See what's working and watch your traffic grow.",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: Shield,
    title: "Full Ownership",
    description:
      "Your content, your blog. Export anytime. We're a tool, not a walled garden.",
    gradient: "from-slate-500/20 to-zinc-500/20",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-foreground">Everything You Need.</span>{" "}
            <span className="gold-text-gradient">Nothing You Don&apos;t.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We&apos;ve stripped away the complexity. What&apos;s left is a seamless,
            fully-automated content machine that works while you sleep.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
              whileHover={{ y: -8 }}
              className="group relative cursor-pointer"
            >
              {/* Gradient background on hover */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}
              />
              <div className="relative h-full p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm group-hover:border-primary/40 transition-all duration-300 overflow-hidden">
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                />

                <motion.div
                  className="relative w-12 h-12 rounded-lg gold-gradient flex items-center justify-center mb-4 gold-glow-sm"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {/* Icon pulse animation */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  >
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </motion.div>
                </motion.div>

                <motion.h3
                  className="relative font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  {feature.title}
                </motion.h3>

                <motion.p
                  className="relative text-muted-foreground"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {feature.description}
                </motion.p>

                {/* Bottom accent line on hover */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
