"use client";

import dynamic from "next/dynamic";
import { useEscrowDashboardData } from "@/hooks/useEscrowDashboardData";
import { getUserRole } from "@/utils/role-utils";

// Dynamic import: RoleEscrowDashboard (chart libraries, escrow component tree,
// mock data generators) loads in a separate chunk only when this route is
// visited, keeping it out of the initial JS bundle.
const RoleEscrowDashboard = dynamic(
  () =>
    import("@/components/dashboard/RoleEscrowDashboard").then((m) => ({
      default: m.RoleEscrowDashboard,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4 p-6">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    ),
  },
);

export function RoleEscrowDashboardPage() {
  const { data, notifications, source, loading, refresh } =
    useEscrowDashboardData();
  const userRole = getUserRole() ?? "guest";

  return (
    <RoleEscrowDashboard
      userRole={userRole}
      escrows={data}
      notifications={notifications}
      isLoading={loading}
      source={source}
      onRefresh={refresh}
    />
  );
}
