"use client";

import { useMemo, useState } from "react";
import {
  DEMO_MODE,
  generateMockEscrows,
  generateMockNotifications,
} from "@/lib/demo";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function useEscrowDashboardData() {
  const { user, loading: userLoading } = useCurrentUser();
  const [refreshKey, setRefreshKey] = useState(0);
  const data = useMemo(() => {
    if (!DEMO_MODE || !user) return [];
    return generateMockEscrows(12, user.uid);
  }, [user, refreshKey]);
  const notifications = useMemo(() => generateMockNotifications(data), [data]);

  return {
    data,
    notifications,
    source: user && DEMO_MODE ? ("demo" as const) : ("none" as const),
    loading: userLoading,
    refresh: () => setRefreshKey((key) => key + 1),
  };
}
