"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import DashboardHome from "./DashboardHome";
import ArticlesList from "./ArticlesList";
import ContentSuggestions from "./ContentSuggestions";
import SchedulePage from "./SchedulePage";
import AnalyticsPage from "./AnalyticsPage";
import SettingsPage from "./SettingsPage";
import ArchitecturePage from "./ArchitecturePage";
import ArticleGenerator from "./ArticleGenerator";
import PublishingAnimation from "./PublishingAnimation";
import WordPressAdmin from "./WordPressAdmin";
import WordPressPreview from "./WordPressPreview";
import { CardErrorBoundary } from "@/components/ui/error-boundary";

const pageConfig: Record<string, { title: string; subtitle?: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Welcome back! Here's your blog overview." },
  articles: { title: "Articles", subtitle: "Manage your AI-generated content" },
  suggestions: { title: "Content Ideas", subtitle: "AI-powered topic suggestions" },
  schedule: { title: "Schedule", subtitle: "Manage your publishing calendar" },
  analytics: { title: "Analytics", subtitle: "Track your blog performance" },
  settings: { title: "Settings", subtitle: "Configure your preferences" },
  architecture: { title: "Architecture", subtitle: "System architecture diagrams and issues" },
};

interface DashboardLayoutProps {
  onBackToLanding?: () => void;
  initialPage?: string;
}

// Mock article content for the WordPress flow
const mockPublishedArticle = {
  title: "Next.js 14 Server Components: A Complete Migration Guide",
  content: `Server Components represent a paradigm shift in how we build React applications. With Next.js 14, migrating to Server Components has never been easier.`,
};

type OverlayView = "none" | "publishing" | "wp-admin" | "public-preview";

export default function DashboardLayout({ onBackToLanding, initialPage }: DashboardLayoutProps) {
  const [currentPage, setCurrentPage] = useState(initialPage || "dashboard");
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<{
    title: string;
    keyword: string;
  } | null>(null);
  const [overlayView, setOverlayView] = useState<OverlayView>("none");
  const [publishedArticle, setPublishedArticle] = useState(mockPublishedArticle);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleGenerateNew = () => {
    setShowGenerator(true);
  };

  const handleSelectSuggestion = (suggestion: { title: string; keyword: string }) => {
    setSelectedSuggestion(suggestion);
    setShowGenerator(true);
  };

  const handleGeneratorClose = () => {
    setShowGenerator(false);
    setSelectedSuggestion(null);
  };

  // New flow: Generator complete → Publishing animation
  const handleGeneratorComplete = () => {
    // Update the published article with the suggestion title if available
    if (selectedSuggestion) {
      setPublishedArticle({
        ...mockPublishedArticle,
        title: selectedSuggestion.title,
      });
    }
    setShowGenerator(false);
    setSelectedSuggestion(null);
    setOverlayView("publishing");
  };

  // Publishing complete → WordPress admin
  const handlePublishingComplete = () => {
    setOverlayView("wp-admin");
  };

  // View live site from WordPress admin
  const handleViewLive = () => {
    setOverlayView("public-preview");
  };

  // Back to dashboard from WordPress admin
  const handleBackFromWpAdmin = () => {
    setOverlayView("none");
    setCurrentPage("articles");
  };

  // Close public preview
  const handleClosePreview = () => {
    setOverlayView("wp-admin");
  };

  const config = pageConfig[currentPage] || pageConfig.dashboard;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Content - responsive margin */}
      <div className="lg:ml-[280px] transition-all">
        <DashboardHeader
          title={config.title}
          subtitle={config.subtitle}
          onBackToLanding={onBackToLanding}
        />

        <main className="min-h-[calc(100vh-4rem)] pt-14 lg:pt-0">
          <AnimatePresence mode="wait">
            {currentPage === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CardErrorBoundary>
                  <DashboardHome onNavigate={handleNavigate} />
                </CardErrorBoundary>
              </motion.div>
            )}
            {currentPage === "articles" && (
              <motion.div
                key="articles"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CardErrorBoundary>
                  <ArticlesList onGenerateNew={handleGenerateNew} />
                </CardErrorBoundary>
              </motion.div>
            )}
            {currentPage === "suggestions" && (
              <motion.div
                key="suggestions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CardErrorBoundary>
                  <ContentSuggestions onSelectSuggestion={handleSelectSuggestion} />
                </CardErrorBoundary>
              </motion.div>
            )}
            {currentPage === "schedule" && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CardErrorBoundary>
                  <SchedulePage onGenerateNew={handleGenerateNew} />
                </CardErrorBoundary>
              </motion.div>
            )}
            {currentPage === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CardErrorBoundary>
                  <AnalyticsPage />
                </CardErrorBoundary>
              </motion.div>
            )}
            {currentPage === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CardErrorBoundary>
                  <SettingsPage />
                </CardErrorBoundary>
              </motion.div>
            )}
            {currentPage === "architecture" && (
              <motion.div
                key="architecture"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CardErrorBoundary>
                  <ArchitecturePage onNavigate={handleNavigate} />
                </CardErrorBoundary>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Article Generator Modal */}
      <AnimatePresence>
        {showGenerator && (
          <ArticleGenerator
            suggestion={selectedSuggestion || undefined}
            onClose={handleGeneratorClose}
            onComplete={handleGeneratorComplete}
          />
        )}
      </AnimatePresence>

      {/* Publishing Animation Overlay */}
      <AnimatePresence>
        {overlayView === "publishing" && (
          <PublishingAnimation
            article={publishedArticle}
            onComplete={handlePublishingComplete}
          />
        )}
      </AnimatePresence>

      {/* WordPress Admin Overlay */}
      <AnimatePresence>
        {overlayView === "wp-admin" && (
          <WordPressAdmin
            publishedArticle={publishedArticle}
            onViewLive={handleViewLive}
            onBackToDashboard={handleBackFromWpAdmin}
          />
        )}
      </AnimatePresence>

      {/* Public Preview Overlay */}
      <AnimatePresence>
        {overlayView === "public-preview" && (
          <WordPressPreview
            article={{
              title: publishedArticle.title,
              content: publishedArticle.content,
              category: "Web Development",
              tags: ["Next.js", "React", "Server Components", "Migration"],
              date: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            }}
            onClose={handleClosePreview}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
