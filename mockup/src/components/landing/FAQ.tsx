"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How is this different from other AI writing tools?",
    answer:
      "Most AI writing tools are just that - tools. You still need to set up WordPress, configure hosting, handle SEO, and publish manually. Argo Note is an all-in-one solution: we provision and manage your WordPress blog, generate content, and publish automatically. You literally just enter your URL and walk away.",
  },
  {
    question: "Do I own my content and blog?",
    answer:
      "Absolutely. Your blog runs on a real WordPress installation. You can export all your content anytime, point your own domain at it, or even migrate it to your own hosting if you ever want to leave. We believe in giving you full ownership.",
  },
  {
    question: "How does the AI generate content?",
    answer:
      "We use a combination of Claude 3.5 Sonnet and GPT-4 to analyze your niche, research trending topics, and write SEO-optimized articles. Each article goes through multiple quality checks before publishing. The AI understands your brand voice and maintains consistency across all posts.",
  },
  {
    question: "Can I customize the content before it's published?",
    answer:
      "Yes! While the system is designed to run on autopilot, you can review and edit any article before it goes live. You can also set preferences for topics, tone, and publishing schedule from your dashboard.",
  },
  {
    question: "What if I already have a blog?",
    answer:
      "We can connect to your existing WordPress blog and start generating content there. During onboarding, you'll have the option to either create a new blog or connect an existing one.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 relative">
      <div className="absolute inset-0 particle-bg opacity-30" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-foreground">Frequently Asked</span>{" "}
            <span className="gold-text-gradient">Questions</span>
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: openIndex === index ? 1 : 1.01 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left group"
              >
                <motion.div
                  className={`relative p-6 rounded-xl border transition-all duration-300 overflow-hidden ${
                    openIndex === index
                      ? "border-primary/50 bg-primary/5"
                      : "border-border/50 bg-card/30 hover:border-primary/30"
                  }`}
                  layout
                >
                  {/* Background glow when open */}
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 pointer-events-none"
                      />
                    )}
                  </AnimatePresence>
                  {/* Hover shine effect */}
                  <motion.div
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-primary/5 to-transparent pointer-events-none"
                  />

                  <div className="relative flex items-center justify-between gap-4">
                    <motion.h3
                      className={`font-semibold transition-colors ${
                        openIndex === index ? "text-primary" : "text-foreground group-hover:text-primary"
                      }`}
                      layout="position"
                    >
                      {faq.question}
                    </motion.h3>
                    <motion.div
                      animate={{
                        rotate: openIndex === index ? 180 : 0,
                        scale: openIndex === index ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        openIndex === index
                          ? "bg-primary/20"
                          : "bg-transparent group-hover:bg-primary/10"
                      }`}
                    >
                      <ChevronDown
                        className={`w-5 h-5 transition-colors ${
                          openIndex === index
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-primary"
                        }`}
                      />
                    </motion.div>
                  </div>

                  <AnimatePresence mode="wait">
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: { duration: 0.3, ease: "easeOut" },
                          opacity: { duration: 0.2, delay: 0.1 }
                        }}
                        className="relative overflow-hidden"
                      >
                        <motion.p
                          initial={{ y: -10 }}
                          animate={{ y: 0 }}
                          exit={{ y: -10 }}
                          className="mt-4 text-muted-foreground leading-relaxed"
                        >
                          {faq.answer}
                        </motion.p>
                        {/* Bottom accent line */}
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.2, duration: 0.4 }}
                          className="mt-4 h-0.5 bg-gradient-to-r from-primary/50 via-primary/20 to-transparent origin-left"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
