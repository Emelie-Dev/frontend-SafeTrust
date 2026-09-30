/* eslint-disable @typescript-eslint/no-explicit-any */
interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: {
    method: string;
    params?: unknown[] | Record<string, unknown>;
  }) => Promise<unknown>;
  on?: <T = unknown>(event: string, handler: (...args: T[]) => void) => void;
  removeListener?: <T = unknown>(
    event: string,
    handler: (...args: T[]) => void,
  ) => void;
  selectedAddress?: string | null;
  networkVersion?: string;
  chainId?: string;
}

interface Window {
  ethereum?: EthereumProvider;
}

declare module "react-icons/*";

declare module "ethers" {
  export namespace ethers {
    export interface Eip1193Provider {
      request: (args: {
        method: string;
        params?: unknown[] | Record<string, unknown>;
      }) => Promise<unknown>;
    }
    export class BrowserProvider {
      constructor(provider: unknown);
      getSigner(): Promise<JsonRpcSigner>;
      getNetwork(): Promise<{ chainId: bigint; name: string }>;
      getBalance(address: string): Promise<bigint>;
    }
    export class JsonRpcSigner {
      getAddress(): Promise<string>;
      signMessage(message: string): Promise<string>;
    }
    export function formatEther(wei: bigint | string): string;
    export function parseEther(ether: string): bigint;
  }
}

declare module "react-day-picker" {
  import * as React from "react";
  export type DateRange = {
    from: Date | undefined;
    to?: Date | undefined;
  };
  export type ChevronProps = {
    orientation?: "left" | "right" | "up" | "down" | string;
    className?: string;
    size?: number;
    disabled?: boolean;
    [key: string]: any;
  };
  export type DayPickerProps = {
    className?: string;
    classNames?: Record<string, string>;
    showOutsideDays?: boolean;
    mode?: "default" | "single" | "multiple" | "range" | string;
    selected?: any;
    onSelect?: any;
    components?: {
      Chevron?: React.ComponentType<ChevronProps>;
      [key: string]: any;
    };
    [key: string]: any;
  };
  export const DayPicker: React.FC<DayPickerProps>;
}

declare module "firebase/app" {
  export class FirebaseError extends Error {
    code: string;
  }
  export function initializeApp(config: Record<string, unknown>): unknown;
  export function getApps(): unknown[];
  export function getApp(): unknown;
}

declare module "firebase/auth" {
  export interface User {
    getIdToken(forceRefresh?: boolean): Promise<string>;
    email?: string | null;
    uid?: string;
    displayName?: string | null;
    photoURL?: string | null;
    metadata: {
      creationTime?: string;
      lastSignInTime?: string;
    };
  }

  export interface Auth {
    currentUser: User | null;
  }
  export interface UserCredential {
    user: User;
  }
  export class GoogleAuthProvider {}
  export function getAuth(app?: unknown): Auth;
  export function connectAuthEmulator(
    auth: unknown,
    url: string,
    options?: unknown,
  ): void;
  export function signInWithEmailAndPassword(
    auth: unknown,
    email: string,
    password: string,
  ): Promise<UserCredential>;
  export function signInWithPopup(
    auth: unknown,
    provider: unknown,
  ): Promise<UserCredential>;
  export function onAuthStateChanged(
    auth: unknown,
    nextOrObserver: (user: User | null) => void,
  ): () => void;
  export function signOut(auth: unknown): Promise<void>;
  export function createUserWithEmailAndPassword(
    auth: unknown,
    email: string,
    password: string,
  ): Promise<UserCredential>;
  export function sendPasswordResetEmail(
    auth: unknown,
    email: string,
  ): Promise<void>;
  export function updateProfile(
    user: User,
    profile: { displayName?: string | null; photoURL?: string | null },
  ): Promise<void>;
}
