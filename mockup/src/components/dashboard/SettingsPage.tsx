"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  User,
  Globe,
  Palette,
  Bell,
  Shield,
  CreditCard,
  ExternalLink,
  Save,
  Sparkles,
  Key,
  Link2,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

// Animated toggle switch component
function AnimatedToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <motion.button
      className={`relative w-12 h-6 rounded-full p-1 transition-colors ${
        enabled ? "bg-primary" : "bg-muted"
      }`}
      onClick={onChange}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-4 h-4 rounded-full bg-primary-foreground flex items-center justify-center"
        animate={{ x: enabled ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <AnimatePresence mode="wait">
          {enabled && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Check className="w-2.5 h-2.5 text-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {/* Glow effect when enabled */}
      {enabled && (
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/30 blur-md -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </motion.button>
  );
}

const settingsSections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "blog", label: "Blog Settings", icon: Globe },
  { id: "ai", label: "AI Settings", icon: Sparkles },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
];

// AI Settings Tab Component with state
function AISettingsTab() {
  const [autoPublish, setAutoPublish] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-primary" />
            </motion.div>
            AI Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Label>Writing Style</Label>
              <motion.select
                className="w-full p-3 rounded-lg bg-secondary/50 border border-border/50 text-foreground focus:border-primary transition-colors"
                whileFocus={{ scale: 1.01 }}
              >
                <option>Professional & Informative</option>
                <option>Casual & Friendly</option>
                <option>Technical & Detailed</option>
                <option>Conversational</option>
              </motion.select>
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Label>Target Article Length</Label>
              <select className="w-full p-3 rounded-lg bg-secondary/50 border border-border/50 text-foreground focus:border-primary transition-colors">
                <option>Short (800-1200 words)</option>
                <option>Medium (1500-2000 words)</option>
                <option>Long (2500-3500 words)</option>
              </select>
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Label>Content Focus</Label>
              <Input
                defaultValue="Web Development, React, TypeScript, Node.js"
                className="bg-secondary/50 border-border/50 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated topics the AI should focus on
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ x: 4 }}
              className={`p-4 rounded-lg border transition-all ${
                autoPublish
                  ? "bg-primary/5 border-primary/20"
                  : "bg-secondary/30 border-border/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">
                  Auto-publish articles
                </span>
                <AnimatedToggle
                  enabled={autoPublish}
                  onChange={() => setAutoPublish(!autoPublish)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically publish articles after generation
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button className="gold-gradient text-primary-foreground group">
              <motion.div
                className="mr-2"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Save className="w-4 h-4" />
              </motion.div>
              <span>Save Changes</span>
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Notifications Tab Component with state
function NotificationsTab() {
  const [notifications, setNotifications] = useState([
    {
      id: "published",
      title: "Article Published",
      description: "Get notified when an article is published",
      enabled: true,
    },
    {
      id: "weekly",
      title: "Weekly Performance Report",
      description: "Receive weekly analytics summary",
      enabled: true,
    },
    {
      id: "errors",
      title: "Generation Errors",
      description: "Alert when article generation fails",
      enabled: true,
    },
    {
      id: "rankings",
      title: "Keyword Ranking Updates",
      description: "Notify on significant ranking changes",
      enabled: false,
    },
  ]);

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Bell className="w-5 h-5 text-primary" />
            </motion.div>
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 4 }}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                notification.enabled
                  ? "bg-primary/5 border-primary/20"
                  : "bg-secondary/30 border-border/50"
              }`}
            >
              <div className="flex-1">
                <motion.p
                  className={`font-medium transition-colors ${
                    notification.enabled ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {notification.title}
                </motion.p>
                <p className="text-sm text-muted-foreground">
                  {notification.description}
                </p>
              </div>
              <AnimatedToggle
                enabled={notification.enabled}
                onChange={() => toggleNotification(notification.id)}
              />
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button className="gold-gradient text-primary-foreground group">
              <motion.div
                className="mr-2"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Save className="w-4 h-4" />
              </motion.div>
              <span>Save Changes</span>
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Settings loading skeleton
function SettingsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar skeleton */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>

        {/* Content skeleton */}
        <div className="lg:col-span-3">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-9 w-28 rounded-lg" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <Skeleton className="h-10 w-32 rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    toast.success("Settings Saved", "Your changes have been saved successfully.");
  };

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and blog preferences
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <nav className="space-y-1">
                {settingsSections.map((section, index) => (
                  <motion.button
                    key={section.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setActiveTab(section.id)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === section.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {/* Active indicator */}
                    {activeTab === section.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <motion.div
                      className="relative z-10"
                      animate={activeTab === section.id ? { rotate: [0, -10, 10, 0] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <section.icon className="w-4 h-4" />
                    </motion.div>
                    <span className="relative z-10">{section.label}</span>
                  </motion.button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
                    >
                      <User className="w-5 h-5 text-primary" />
                    </motion.div>
                    Profile Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <motion.div
                    className="flex items-center gap-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.div
                      className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/50 to-primary/20 flex items-center justify-center group cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <User className="w-10 h-10 text-primary" />
                      {/* Hover glow */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                      {/* Animated ring */}
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary/30"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                    <div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="outline" className="border-primary/30 hover:border-primary/50 transition-colors">
                          Upload Photo
                        </Button>
                      </motion.div>
                      <p className="text-xs text-muted-foreground mt-2">
                        JPG, PNG or GIF. Max 2MB.
                      </p>
                    </div>
                  </motion.div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <Label>Full Name</Label>
                      <Input
                        defaultValue="John Developer"
                        className="bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                      />
                    </motion.div>
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Label>Email</Label>
                      <Input
                        type="email"
                        defaultValue="john@example.com"
                        className="bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <Label>Bio</Label>
                    <Input
                      defaultValue="Full-stack developer passionate about React and TypeScript"
                      className="bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button className="gold-gradient text-primary-foreground group" onClick={handleSave}>
                      <motion.div
                        className="mr-2"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Save className="w-4 h-4" />
                      </motion.div>
                      <span>Save Changes</span>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "blog" && (
            <motion.div
              key="blog"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Globe className="w-5 h-5 text-primary" />
                    </motion.div>
                    Blog Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <motion.div
                    className="p-4 rounded-lg bg-primary/5 border border-primary/20 relative overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/5 to-transparent"
                      animate={{ translateX: ["100%", "-100%"] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">Your Blog</span>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                        >
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <motion.span
                              className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"
                              animate={{ opacity: [1, 0.4, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                            Active
                          </Badge>
                        </motion.div>
                      </div>
                      <motion.a
                        href="#"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                        whileHover={{ x: 4 }}
                      >
                        techblog.argonote.com
                        <ExternalLink className="w-3 h-3" />
                      </motion.a>
                    </div>
                  </motion.div>

                  <div className="space-y-4">
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <Label>Blog Name</Label>
                      <Input
                        defaultValue="Tech Blog"
                        className="bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                      />
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Label>Blog Description</Label>
                      <Input
                        defaultValue="Insights on web development, React, and modern JavaScript"
                        className="bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                      />
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <Label>Custom Domain</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="blog.yourdomain.com"
                          className="bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                        />
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button variant="outline" className="border-primary/30 hover:border-primary/50 transition-colors">
                            <Link2 className="w-4 h-4 mr-2" />
                            Connect
                          </Button>
                        </motion.div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Point your domain's CNAME to argonote.com
                      </p>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button className="gold-gradient text-primary-foreground group" onClick={handleSave}>
                      <motion.div
                        className="mr-2"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Save className="w-4 h-4" />
                      </motion.div>
                      <span>Save Changes</span>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "ai" && (
            <AISettingsTab />
          )}

          {activeTab === "notifications" && (
            <NotificationsTab />
          )}

          {activeTab === "billing" && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <motion.div
                      initial={{ rotateY: 0 }}
                      animate={{ rotateY: [0, 180, 360] }}
                      transition={{ duration: 1, delay: 0.2 }}
                    >
                      <CreditCard className="w-5 h-5 text-primary" />
                    </motion.div>
                    Billing & Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <motion.div
                    className="p-6 rounded-xl bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 relative overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {/* Decorative particles */}
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-24 h-24 bg-primary/5 rounded-full blur-2xl"
                        style={{ left: `${20 + i * 30}%`, top: `${10 + i * 20}%` }}
                        animate={{
                          x: [0, 10, 0],
                          y: [0, -10, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 3 + i,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                      />
                    ))}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                          >
                            <Badge className="bg-primary/20 text-primary border-primary/30 mb-2">
                              <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              >
                                <Sparkles className="w-3 h-3 mr-1" />
                              </motion.div>
                              Pro Plan
                            </Badge>
                          </motion.div>
                          <motion.p
                            className="text-3xl font-bold gold-text-gradient"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            $20<span className="text-lg text-muted-foreground">/month</span>
                          </motion.p>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button variant="outline" className="border-primary/30 hover:border-primary/50 transition-colors">
                            Upgrade
                          </Button>
                        </motion.div>
                      </div>
                      <motion.div
                        className="text-sm text-muted-foreground space-y-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <p>Next billing date: February 1, 2024</p>
                        <p>4 articles remaining this month</p>
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h4 className="font-medium text-foreground">Payment Method</h4>
                    <motion.div
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50 group cursor-pointer"
                      whileHover={{ x: 4, borderColor: "rgba(212, 175, 55, 0.3)" }}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="w-10 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold"
                          whileHover={{ scale: 1.1 }}
                        >
                          VISA
                        </motion.div>
                        <div>
                          <p className="font-medium text-foreground">•••• 4242</p>
                          <p className="text-xs text-muted-foreground">
                            Expires 12/25
                          </p>
                        </div>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="ghost" size="sm">
                          Update
                        </Button>
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h4 className="font-medium text-foreground">Billing History</h4>
                    {[
                      { date: "Jan 1, 2024", amount: "$20.00", status: "Paid" },
                      { date: "Dec 1, 2023", amount: "$20.00", status: "Paid" },
                      { date: "Nov 1, 2023", amount: "$20.00", status: "Paid" },
                    ].map((invoice, index) => (
                      <motion.div
                        key={invoice.date}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + index * 0.05 }}
                        whileHover={{ x: 4 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors"
                      >
                        <span className="text-sm text-muted-foreground">
                          {invoice.date}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {invoice.amount}
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-400 border-green-500/30"
                        >
                          <motion.span
                            className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
                          />
                          {invoice.status}
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
