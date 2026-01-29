// Argo Note - Pipeline Logger
// Provides detailed logging for article generation pipeline

export type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'debug';

export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  step: string;
  message: string;
  details?: Record<string, unknown>;
  durationMs?: number;
};

export type PipelineLogger = {
  logs: LogEntry[];
  log: (level: LogLevel, step: string, message: string, details?: Record<string, unknown>) => void;
  startTimer: (step: string) => () => number;
  info: (step: string, message: string, details?: Record<string, unknown>) => void;
  success: (step: string, message: string, details?: Record<string, unknown>) => void;
  warning: (step: string, message: string, details?: Record<string, unknown>) => void;
  error: (step: string, message: string, details?: Record<string, unknown>) => void;
  debug: (step: string, message: string, details?: Record<string, unknown>) => void;
};

export function createPipelineLogger(): PipelineLogger {
  const logs: LogEntry[] = [];
  const timers: Map<string, number> = new Map();

  const log = (level: LogLevel, step: string, message: string, details?: Record<string, unknown>) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      step,
      message,
      details,
    };
    logs.push(entry);

    // Also log to console for server-side debugging
    const prefix = `[${step}]`;
    const detailStr = details ? ` ${JSON.stringify(details)}` : '';
    switch (level) {
      case 'error':
        console.error(prefix, message, detailStr);
        break;
      case 'warning':
        console.warn(prefix, message, detailStr);
        break;
      case 'debug':
        console.debug(prefix, message, detailStr);
        break;
      default:
        console.log(prefix, message, detailStr);
    }
  };

  const startTimer = (step: string) => {
    const start = Date.now();
    timers.set(step, start);
    return () => {
      const duration = Date.now() - start;
      timers.delete(step);
      return duration;
    };
  };

  return {
    logs,
    log,
    startTimer,
    info: (step, message, details) => log('info', step, message, details),
    success: (step, message, details) => log('success', step, message, details),
    warning: (step, message, details) => log('warning', step, message, details),
    error: (step, message, details) => log('error', step, message, details),
    debug: (step, message, details) => log('debug', step, message, details),
  };
}
