"use client";

import { useReducer } from "react";
import {
  DEMO_MODE,
  generateMockEscrows,
  generateMockNotifications,
} from "@/lib/demo";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function useEscrowDashboardData() {
  const { user, loading: userLoading } = useCurrentUser();
  const [, refresh] = useReducer((revision: number) => revision + 1, 0);
  const data = user && DEMO_MODE ? generateMockEscrows(12, user.uid) : [];
  const notifications = generateMockNotifications(data);

  return {
    data,
    notifications,
    source: user && DEMO_MODE ? ("demo" as const) : ("none" as const),
    loading: userLoading,
    refresh,
  };
}
