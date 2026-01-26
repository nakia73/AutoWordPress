"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgClass: "bg-green-500/10 border-green-500/30",
    iconClass: "text-green-400",
    progressClass: "bg-green-400",
  },
  error: {
    icon: XCircle,
    bgClass: "bg-red-500/10 border-red-500/30",
    iconClass: "text-red-400",
    progressClass: "bg-red-400",
  },
  warning: {
    icon: AlertCircle,
    bgClass: "bg-yellow-500/10 border-yellow-500/30",
    iconClass: "text-yellow-400",
    progressClass: "bg-yellow-400",
  },
  info: {
    icon: Info,
    bgClass: "bg-primary/10 border-primary/30",
    iconClass: "text-primary",
    progressClass: "bg-primary",
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;
  const duration = toast.duration || 5000;

  useEffect(() => {
    const timer = setTimeout(onRemove, duration);
    return () => clearTimeout(timer);
  }, [duration, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`relative w-80 rounded-xl border ${config.bgClass} bg-card/95 backdrop-blur-sm shadow-lg overflow-hidden`}
    >
      <div className="p-4 pr-10">
        <div className="flex items-start gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
          >
            <Icon className={`w-5 h-5 ${config.iconClass} flex-shrink-0 mt-0.5`} />
          </motion.div>
          <div className="flex-1 min-w-0">
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="font-medium text-foreground"
            >
              {toast.title}
            </motion.p>
            {toast.description && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="text-sm text-muted-foreground mt-1"
              >
                {toast.description}
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* Close button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onRemove}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-secondary/50 transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </motion.button>

      {/* Progress bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-1 ${config.progressClass}`}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
      />
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onRemove={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const { addToast } = context;

  return {
    success: (title: string, description?: string) =>
      addToast({ type: "success", title, description }),
    error: (title: string, description?: string) =>
      addToast({ type: "error", title, description }),
    warning: (title: string, description?: string) =>
      addToast({ type: "warning", title, description }),
    info: (title: string, description?: string) =>
      addToast({ type: "info", title, description }),
  };
}

// Demo toast trigger for mockup
export function ToastDemo() {
  const toast = useToast();

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => toast.success("Article Published!", "Your article is now live.")}
        className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30 transition-colors"
      >
        Success
      </button>
      <button
        onClick={() => toast.error("Generation Failed", "Please try again later.")}
        className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors"
      >
        Error
      </button>
      <button
        onClick={() => toast.warning("Rate Limit", "You're approaching your monthly limit.")}
        className="px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 text-sm hover:bg-yellow-500/30 transition-colors"
      >
        Warning
      </button>
      <button
        onClick={() => toast.info("Tip", "Try using keywords for better SEO.")}
        className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-sm hover:bg-primary/30 transition-colors"
      >
        Info
      </button>
    </div>
  );
}
