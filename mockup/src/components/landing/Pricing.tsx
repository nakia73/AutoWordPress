"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  "Fully managed WordPress blog",
  "4 AI-generated articles per month",
  "SEO optimization included",
  "Automatic publishing",
  "Performance analytics dashboard",
  "Priority email support",
  "Export your content anytime",
  "Custom domain support",
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
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
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-foreground">Simple, Transparent</span>{" "}
            <span className="gold-text-gradient">Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            One plan. Everything included. No hidden fees, no credit packs.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-lg mx-auto"
        >
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-2xl blur-xl opacity-30" />

            {/* Card */}
            <motion.div
              className="relative rounded-2xl border border-primary/30 bg-card/80 backdrop-blur-sm overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Animated border glow */}
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ boxShadow: "inset 0 0 30px rgba(212, 175, 55, 0.2)" }}
              />
              {/* Shine effect on hover */}
              <motion.div
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-primary/10 to-transparent pointer-events-none"
              />

              {/* Header */}
              <div className="relative p-8 text-center border-b border-border/50">
                <motion.div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm mb-4"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  <span>Early Bird Pricing</span>
                </motion.div>
                <motion.div
                  className="mb-4"
                  initial={{ scale: 0.9 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <motion.span
                    className="text-5xl font-bold gold-text-shimmer inline-block"
                    whileHover={{ scale: 1.1 }}
                  >
                    $20
                  </motion.span>
                  <span className="text-muted-foreground">/month</span>
                </motion.div>
                <p className="text-muted-foreground">
                  Join now and lock in this rate forever
                </p>
              </div>

              {/* Features */}
              <div className="relative p-8">
                <ul className="space-y-4">
                  {features.map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 4 }}
                      className="flex items-start gap-3 group/item cursor-default"
                    >
                      <motion.div
                        className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5"
                        whileHover={{ scale: 1.2, backgroundColor: "rgba(212, 175, 55, 0.3)" }}
                      >
                        <Check className="w-3 h-3 text-primary" />
                      </motion.div>
                      <span className="text-foreground group-hover/item:text-primary transition-colors">
                        {feature}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="relative p-8 pt-0">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    className="w-full h-14 gold-gradient text-primary-foreground font-semibold text-lg gold-glow relative overflow-hidden group/btn"
                  >
                    {/* Button shine effect */}
                    <motion.div
                      className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                    <span className="relative z-10">Join the Waitlist</span>
                  </Button>
                </motion.div>
                <motion.p
                  className="text-center text-sm text-muted-foreground mt-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  No credit card required. Get early access.
                </motion.p>
              </div>
            </motion.div>
          </div>

          {/* Beta Offer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 p-4 rounded-xl border border-primary/20 bg-primary/5 text-center"
          >
            <p className="text-sm text-muted-foreground">
              <span className="text-primary font-semibold">Beta Testers:</span>{" "}
              First month free, then $15/month (locked forever)
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
