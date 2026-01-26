"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Sparkles, ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
  { name: "FAQ", href: "#faq" },
];

interface HeaderProps {
  onStartDemo?: () => void;
  onNavigateToArchitecture?: () => void;
}

export default function Header({ onStartDemo, onNavigateToArchitecture }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleGetStarted = () => {
    if (onStartDemo) {
      onStartDemo();
    } else {
      // Scroll to hero section
      document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleArchitectureClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateToArchitecture) {
      onNavigateToArchitecture();
    }
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.a
            href="/"
            className="flex items-center gap-2 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="relative"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-8 w-8 text-primary relative z-10" />
              <motion.div
                className="absolute inset-0 blur-lg bg-primary/30"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <span className="text-xl font-bold gold-text-gradient group-hover:gold-text-shadow transition-all">
              Argo Note
            </span>
          </motion.a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="relative text-sm text-muted-foreground hover:text-foreground transition-colors group"
                whileHover={{ y: -2 }}
              >
                {item.name}
                {/* Animated underline */}
                <motion.span
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary/80 to-primary"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
            {/* Architecture Link - Special navigation */}
            <motion.a
              href="#architecture"
              onClick={handleArchitectureClick}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + navItems.length * 0.05 }}
              className="relative text-sm text-muted-foreground hover:text-primary transition-colors group flex items-center gap-1.5"
              whileHover={{ y: -2 }}
            >
              <Layers className="w-3.5 h-3.5" />
              Architecture
              {/* Animated underline */}
              <motion.span
                className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary/80 to-primary"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>
          </nav>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="hidden md:flex items-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary transition-colors"
              >
                Sign In
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleGetStarted}
                className="gold-gradient text-primary-foreground font-semibold gold-glow-sm relative overflow-hidden group"
              >
                {/* Button shine effect */}
                <motion.div
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
                <span className="relative z-10 flex items-center gap-1">
                  Get Started
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </motion.div>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background border-l border-primary/20 overflow-hidden">
              {/* Decorative background */}
              <div className="absolute inset-0 pointer-events-none">
                <motion.div
                  className="absolute top-20 right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.div
                  className="absolute bottom-32 left-5 w-24 h-24 bg-primary/5 rounded-full blur-xl"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                />
              </div>

              {/* Logo in mobile menu */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-8"
              >
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold gold-text-gradient">Argo Note</span>
              </motion.div>

              <nav className="flex flex-col gap-2 relative z-10">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.08 }}
                    whileHover={{ x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    className="text-lg text-muted-foreground hover:text-primary transition-colors py-3 px-3 rounded-lg flex items-center gap-3 group hover:bg-primary/5"
                    onClick={() => setIsOpen(false)}
                  >
                    <motion.span
                      className="w-0 h-0.5 bg-primary rounded-full group-hover:w-4 transition-all duration-300"
                    />
                    {item.name}
                    <motion.span
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ x: -5 }}
                      whileHover={{ x: 0 }}
                    >
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </motion.span>
                  </motion.a>
                ))}
                {/* Architecture Link - Mobile */}
                <motion.a
                  href="#architecture"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(false);
                    if (onNavigateToArchitecture) {
                      onNavigateToArchitecture();
                    }
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + navItems.length * 0.08 }}
                  whileHover={{ x: 8 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-lg text-muted-foreground hover:text-primary transition-colors py-3 px-3 rounded-lg flex items-center gap-3 group hover:bg-primary/5 border-t border-border/30 mt-2 pt-4"
                >
                  <Layers className="w-4 h-4 text-primary" />
                  Architecture
                  <motion.span
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: -5 }}
                    whileHover={{ x: 0 }}
                  >
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </motion.span>
                </motion.a>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col gap-3 mt-6 pt-6 border-t border-border/50"
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="w-full border-primary/50 text-primary hover:bg-primary/10 h-12"
                    >
                      Sign In
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => {
                        setIsOpen(false);
                        handleGetStarted();
                      }}
                      className="w-full gold-gradient text-primary-foreground font-semibold h-12 relative overflow-hidden group"
                    >
                      <motion.div
                        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      />
                      <span className="relative z-10">Get Started</span>
                    </Button>
                  </motion.div>
                </motion.div>

                {/* Social proof */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 pt-6 border-t border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-full border-2 border-background bg-gradient-to-br from-primary/50 to-primary/20"
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-primary font-medium">127+</span> joined
                    </p>
                  </div>
                </motion.div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
