import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export async function onRequestError(
  error: Error,
  request: Request,
  context: Record<string, unknown>,
) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      tags: {
        route:
          (request as unknown as { path?: string })?.path ||
          (context as unknown as { routerKind?: string })?.routerKind ||
          "unknown",
      },
    });
  }
}
