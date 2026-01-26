"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";

// Landing Page Components
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Problems from "@/components/landing/Problems";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import WaitlistCTA from "@/components/landing/WaitlistCTA";
import Footer from "@/components/landing/Footer";

// Demo Components
import SetupAnimation from "@/components/demo/SetupAnimation";
import OnboardingWizard from "@/components/demo/OnboardingWizard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// Skip link for accessibility
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
    >
      Skip to main content
    </a>
  );
}

type ViewState = "landing" | "setup" | "onboarding" | "dashboard";

export default function Home() {
  const [view, setView] = useState<ViewState>("landing");
  const [demoUrl, setDemoUrl] = useState("");
  const [initialDashboardPage, setInitialDashboardPage] = useState<string | undefined>();

  const handleStartDemo = (url?: string) => {
    setDemoUrl(url || "https://example.com");
    setInitialDashboardPage(undefined);
    setView("setup");
  };

  const handleSetupComplete = () => {
    setView("onboarding");
  };

  const handleOnboardingComplete = () => {
    setView("dashboard");
  };

  const handleBackToLanding = () => {
    setView("landing");
    setDemoUrl("");
    setInitialDashboardPage(undefined);
  };

  // Navigate directly to Architecture page
  const handleNavigateToArchitecture = () => {
    setInitialDashboardPage("architecture");
    setView("dashboard");
  };

  // Dashboard View
  if (view === "dashboard") {
    return <DashboardLayout onBackToLanding={handleBackToLanding} initialPage={initialDashboardPage} />;
  }

  return (
    <>
      {/* Accessibility: Skip link */}
      <SkipLink />

      {/* Landing Page */}
      <Header onStartDemo={() => handleStartDemo()} onNavigateToArchitecture={handleNavigateToArchitecture} />
      <main id="main-content" role="main" aria-label="Main content">
        <Hero onStartDemo={handleStartDemo} />
        <Problems />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <FAQ />
        <WaitlistCTA />
      </main>
      <Footer />

      {/* Setup Animation Overlay */}
      <AnimatePresence>
        {view === "setup" && (
          <SetupAnimation url={demoUrl} onComplete={handleSetupComplete} />
        )}
      </AnimatePresence>

      {/* Onboarding Wizard Overlay */}
      <AnimatePresence>
        {view === "onboarding" && (
          <OnboardingWizard onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>
    </>
  );
}
