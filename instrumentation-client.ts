import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring — sample 10% of transactions in production
  tracesSampleRate: 0.1,

  // Session Replay — capture 5% of sessions, 100% on error
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration(),
  ],

  // Only send errors in production
  enabled: process.env.NODE_ENV === "production",

  // Filter out noise
  ignoreErrors: [
    // Browser extensions
    "ResizeObserver loop",
    // Network errors that aren't actionable
    "Failed to fetch",
    "NetworkError",
    "Load failed",
  ],
});
