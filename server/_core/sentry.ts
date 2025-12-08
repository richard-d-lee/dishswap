import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn) {
    console.warn("[Sentry] SENTRY_DSN not configured, error tracking disabled");
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // Profiling
    profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  });

  console.log("[Sentry] Error tracking initialized");
}

export { Sentry };
