"use client";

import { motion } from "framer-motion";
import { Clock, Brain, Code, TrendingDown } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "No Time to Write",
    description:
      "Building products takes all your energy. Who has time to write blog posts consistently?",
  },
  {
    icon: Brain,
    title: "SEO is Complex",
    description:
      "Keyword research, meta tags, internal linking... It's a full-time job just to understand it.",
  },
  {
    icon: Code,
    title: "Technical Setup",
    description:
      "WordPress hosting, themes, plugins, security updates... You'd rather be coding your product.",
  },
  {
    icon: TrendingDown,
    title: "Inconsistent Publishing",
    description:
      "You start strong, then life happens. Your blog becomes a ghost town after 3 posts.",
  },
];

export default function Problems() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 particle-bg opacity-50" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-foreground">Sound Familiar?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            You know content marketing works. But between building your product
            and running your business, blogging always falls to the bottom of the list.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative cursor-pointer"
            >
              {/* Glow effect on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity"
              />
              <div className="relative p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm group-hover:border-primary/40 transition-all overflow-hidden">
                {/* Shine effect on hover */}
                <motion.div
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                />

                <motion.div
                  className="relative w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    animate={{ rotate: index % 2 === 0 ? [0, 5, -5, 0] : [0, -5, 5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                  >
                    <problem.icon className="w-6 h-6 text-primary" />
                  </motion.div>
                </motion.div>
                <motion.h3
                  className="relative font-semibold text-foreground mb-2 group-hover:text-primary transition-colors"
                >
                  {problem.title}
                </motion.h3>
                <motion.p
                  className="relative text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  {problem.description}
                </motion.p>

                {/* Number indicator */}
                <motion.div
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                >
                  <span className="text-xs font-bold text-primary">{index + 1}</span>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
