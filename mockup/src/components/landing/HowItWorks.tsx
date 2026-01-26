"use client";

import { motion } from "framer-motion";
import { Link2, Cpu, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Link2,
    title: "Enter Your URL",
    description:
      "Drop your website or landing page URL. Our AI will analyze your business, identify your niche, and understand your target audience.",
    visual: (
      <div className="relative p-4 rounded-lg bg-secondary/50 border border-border/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Link2 className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm text-muted-foreground">Enter your website</span>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-md bg-background border border-primary/30">
          <span className="text-muted-foreground">https://</span>
          <span className="text-foreground">myawesomeapp.com</span>
          <span className="ml-auto px-2 py-1 text-xs rounded bg-primary/20 text-primary">
            Analyzing...
          </span>
        </div>
      </div>
    ),
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI Builds Your Blog",
    description:
      "We automatically provision WordPress, configure SEO settings, and generate a content strategy tailored to your niche.",
    visual: (
      <div className="relative p-4 rounded-lg bg-secondary/50 border border-border/50 space-y-3">
        {[
          { label: "Setting up WordPress", done: true },
          { label: "Configuring SEO plugins", done: true },
          { label: "Analyzing competitors", done: true },
          { label: "Generating content plan", done: false, active: true },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                item.done
                  ? "bg-green-500/20 text-green-400"
                  : item.active
                  ? "bg-primary/20 text-primary animate-pulse"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {item.done ? "✓" : item.active ? "●" : "○"}
            </div>
            <span
              className={`text-sm ${
                item.done
                  ? "text-muted-foreground line-through"
                  : item.active
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    number: "03",
    icon: Rocket,
    title: "Watch It Grow",
    description:
      "Sit back as articles are automatically written, optimized, and published. Your blog runs on autopilot while you focus on your product.",
    visual: (
      <div className="relative p-4 rounded-lg bg-secondary/50 border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-foreground">This Week&apos;s Articles</span>
          <span className="text-xs text-primary">+3 published</span>
        </div>
        <div className="space-y-2">
          {[
            { title: "10 Tips for Better UX Design", status: "Published" },
            { title: "Why Speed Matters in 2024", status: "Published" },
            { title: "The Future of AI in Apps", status: "Writing..." },
          ].map((article, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded bg-background/50"
            >
              <span className="text-sm text-foreground truncate">{article.title}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  article.status === "Published"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-primary/20 text-primary"
                }`}
              >
                {article.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="absolute inset-0 particle-bg opacity-30" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="gold-text-gradient">Three Steps</span>{" "}
            <span className="text-foreground">to Autopilot</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From zero to fully-automated blog in under 60 seconds.
            Here&apos;s how the magic happens.
          </p>
        </motion.div>

        <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative group"
            >
              {/* Connector Line (desktop) with animation */}
              {index < steps.length - 1 && (
                <motion.div
                  className="hidden lg:block absolute top-8 left-[calc(100%+1rem)] w-[calc(100%-2rem)] h-px overflow-hidden"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.2 }}
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary/50"
                    initial={{ x: "-100%" }}
                    whileInView={{ x: "0%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.6 + index * 0.2 }}
                  />
                  {/* Animated dot on line */}
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary"
                    initial={{ left: "0%" }}
                    whileInView={{ left: ["0%", "100%", "100%"] }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.8 + index * 0.3 }}
                  />
                </motion.div>
              )}

              <div className="relative">
                {/* Step Number */}
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    className="relative w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center gold-glow-sm overflow-hidden"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: index * 0.5 }}
                    />
                    <step.icon className="w-8 h-8 text-primary-foreground relative z-10" />
                  </motion.div>
                  <motion.span
                    className="text-5xl font-bold text-primary/20"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.2 }}
                    whileHover={{ color: "rgba(212, 175, 55, 0.4)" }}
                  >
                    {step.number}
                  </motion.span>
                </div>

                {/* Content */}
                <motion.h3
                  className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.2 }}
                >
                  {step.title}
                </motion.h3>
                <motion.p
                  className="text-muted-foreground mb-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.2 }}
                >
                  {step.description}
                </motion.p>

                {/* Visual with hover effect */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative"
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                  {step.visual}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
