"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, Check, Loader2, Sparkles, Rocket, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Floating particle configuration
const floatingParticles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${10 + (i * 12)}%`,
  delay: i * 0.4,
  duration: 3 + (i % 3),
  size: 4 + (i % 3) * 2,
}));

export default function WaitlistCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [isFocused, setIsFocused] = useState(false);

  // Email validation
  const isValidEmail = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");

    // Simulate API call (will be replaced with Supabase)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setStatus("success");
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
        <motion.div
          className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.4, 0.3, 0.4],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        {/* Floating particles */}
        {floatingParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bottom-20"
            style={{ left: particle.left }}
            initial={{ y: 0, opacity: 0 }}
            animate={{
              y: [-20, -100, -20],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          >
            {particle.id % 3 === 0 ? (
              <Star className="text-primary/40" style={{ width: particle.size, height: particle.size }} />
            ) : particle.id % 3 === 1 ? (
              <Sparkles className="text-primary/30" style={{ width: particle.size, height: particle.size }} />
            ) : (
              <div className="rounded-full bg-primary/40" style={{ width: particle.size, height: particle.size }} />
            )}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Decorative */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 blur-2xl bg-primary/30"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="relative w-20 h-20 rounded-2xl gold-gradient flex items-center justify-center gold-glow"
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Mail className="w-10 h-10 text-primary-foreground" />
                </motion.div>
              </motion.div>
              {/* Orbiting particles */}
              {[0, 120, 240].map((angle, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-primary/60 rounded-full"
                  style={{ left: "50%", top: "50%" }}
                  animate={{
                    x: [
                      Math.cos(((angle) * Math.PI) / 180) * 50,
                      Math.cos(((angle + 120) * Math.PI) / 180) * 50,
                      Math.cos(((angle + 240) * Math.PI) / 180) * 50,
                      Math.cos(((angle + 360) * Math.PI) / 180) * 50,
                    ],
                    y: [
                      Math.sin(((angle) * Math.PI) / 180) * 50,
                      Math.sin(((angle + 120) * Math.PI) / 180) * 50,
                      Math.sin(((angle + 240) * Math.PI) / 180) * 50,
                      Math.sin(((angle + 360) * Math.PI) / 180) * 50,
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
              ))}
            </div>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-foreground">Ready to Put Your Blog on</span>
            <br />
            <span className="gold-text-gradient gold-shimmer">Autopilot?</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Join the waitlist to get early access. Be among the first to experience
            fully automated blog content generation.
          </p>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative"
              >
                {/* Celebration particles */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      left: "50%",
                      top: "50%",
                      backgroundColor: i % 3 === 0 ? "#D4AF37" : i % 3 === 1 ? "#4ade80" : "#60a5fa",
                    }}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      x: Math.cos((i * 30 * Math.PI) / 180) * (80 + Math.random() * 40),
                      y: Math.sin((i * 30 * Math.PI) / 180) * (80 + Math.random() * 40),
                    }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                  />
                ))}

                <motion.div
                  className="relative inline-flex items-center gap-4 px-8 py-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-primary/10 border border-green-500/30 overflow-hidden"
                  animate={{ boxShadow: ["0 0 20px rgba(74, 222, 128, 0.2)", "0 0 40px rgba(74, 222, 128, 0.3)", "0 0 20px rgba(74, 222, 128, 0.2)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />

                  <motion.div
                    className="relative w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Check className="w-7 h-7 text-green-400" />
                    </motion.div>
                  </motion.div>

                  <div className="relative text-left">
                    <motion.p
                      className="font-bold text-lg text-foreground flex items-center gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      You&apos;re on the list!
                      <motion.span
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <Rocket className="w-5 h-5 text-primary" />
                      </motion.span>
                    </motion.p>
                    <motion.p
                      className="text-muted-foreground"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      We&apos;ll notify you when we launch.
                    </motion.p>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="max-w-md mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.div
                    className="relative flex-1 group"
                    animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <motion.div
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      animate={isFocused ? { scale: 1.1, color: "#D4AF37" } : { scale: 1 }}
                    >
                      <Mail className="w-5 h-5" />
                    </motion.div>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      required
                      disabled={status === "loading"}
                      className="pl-12 h-14 text-lg bg-secondary/50 border-primary/20 focus:border-primary focus:ring-primary transition-all"
                    />
                    {/* Focus glow */}
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-primary/10 blur-xl -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isFocused ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                    />
                    {/* Email validation indicator */}
                    <AnimatePresence>
                      {email.length > 0 && (
                        <motion.div
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                        >
                          {isValidEmail ? (
                            <Check className="w-5 h-5 text-green-400" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-yellow-400" />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={status === "loading"}
                      className="h-14 px-8 gold-gradient text-primary-foreground font-semibold gold-glow group relative overflow-hidden"
                    >
                      {/* Button shine */}
                      <motion.div
                        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      />
                      {status === "loading" ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <span className="relative z-10 flex items-center">
                          <span>Join Waitlist</span>
                          <motion.div
                            className="ml-2"
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <ArrowRight className="w-5 h-5" />
                          </motion.div>
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </div>
                <motion.p
                  className="text-sm text-muted-foreground mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  No spam. Unsubscribe anytime. We respect your inbox.
                </motion.p>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/50 to-primary/20 relative overflow-hidden"
                  initial={{ scale: 0, x: -20 }}
                  whileInView={{ scale: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, repeatDelay: 3 }}
                  />
                </motion.div>
              ))}
            </div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
            >
              <motion.span
                className="text-primary font-semibold"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                127+
              </motion.span>{" "}
              indie hackers already joined
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
