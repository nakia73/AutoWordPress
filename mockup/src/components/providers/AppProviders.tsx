"use client";

import { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { PageErrorBoundary } from "@/components/ui/error-boundary";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <PageErrorBoundary>
      <ToastProvider>{children}</ToastProvider>
    </PageErrorBoundary>
  );
}
