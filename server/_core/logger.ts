// Centralized logging utility for error tracking and monitoring
type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  stack?: string;
}

class Logger {
  private formatLog(entry: LogEntry): string {
    const { level, message, context, timestamp, stack } = entry;
    let log = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      log += `\n  Context: ${JSON.stringify(context, null, 2)}`;
    }
    
    if (stack) {
      log += `\n  Stack: ${stack}`;
    }
    
    return log;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      stack: error?.stack,
    };

    const formattedLog = this.formatLog(entry);

    // In production, you would send this to a logging service like:
    // - Sentry
    // - LogRocket
    // - Datadog
    // - CloudWatch
    // - Or write to a file
    
    switch (level) {
      case "error":
        console.error(formattedLog);
        // TODO: Send to error tracking service (Sentry, etc.)
        break;
      case "warn":
        console.warn(formattedLog);
        break;
      case "info":
        console.log(formattedLog);
        break;
      case "debug":
        if (process.env.NODE_ENV === "development") {
          console.debug(formattedLog);
        }
        break;
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.log("error", message, context, error);
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log("debug", message, context);
  }
}

export const logger = new Logger();

// Helper function to log tRPC errors
export function logTRPCError(
  procedure: string,
  error: unknown,
  input?: unknown
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  logger.error(`tRPC procedure error: ${procedure}`, error as Error, {
    procedure,
    input,
    errorMessage,
  });
}

// Helper function to log authentication errors
export function logAuthError(
  action: string,
  error: unknown,
  context?: Record<string, unknown>
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  logger.error(`Authentication error: ${action}`, error as Error, {
    action,
    ...context,
  });
}

// Helper function to log database errors
export function logDatabaseError(
  operation: string,
  error: unknown,
  context?: Record<string, unknown>
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  logger.error(`Database error: ${operation}`, error as Error, {
    operation,
    ...context,
  });
}
