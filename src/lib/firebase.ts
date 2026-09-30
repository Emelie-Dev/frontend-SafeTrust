import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// firebase.ts
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const missing = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  throw new Error(`Missing Firebase config: ${missing.join(", ")}`);
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/**
 * Synchronous auth instance used by components on auth/dashboard routes
 * (Register, ForgotPasswordForm, LogoutButton, Header, EditProfileForm).
 *
 * Do NOT import this from public-browse routes (/, /rent, /room) — use
 * `getAuthInstance()` from `@/lib/firebase-app` instead so that
 * firebase/auth is excluded from those page bundles.
 */
export const auth = getAuth(app);
