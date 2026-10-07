import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  (Sentry.init as any)({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    sendDefaultPii: false,
    beforeSend(event: any) {
      if (event.request?.headers) {
        delete event.request.headers["authorization"];
        delete event.request.headers["cookie"];
      }
      if (event.request?.cookies) {
        delete event.request.cookies["firebase-token"];
        delete event.request.cookies["session"];
      }
      if (event.extra) {
        delete event.extra.customToken;
        delete event.extra.signedXdr;
      }
      return event;
    },
  });
}
