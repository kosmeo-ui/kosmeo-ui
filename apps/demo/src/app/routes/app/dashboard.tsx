import { getRecentCustomersQueryOptions } from "@/features/customers/api/get-recent-customers";
import { RecentCustomers } from "@/features/customers/components/recent-customers";
import { WorkspaceSetup } from "@/features/dashboard/components/workspace-setup";
import { StatsOverview } from "@/features/dashboard/components/stats-overview";
import { WelcomeBanner } from "@/features/dashboard/components/welcome-banner";
import { getStatsQueryOptions } from "@/features/dashboard/api/get-stats";
import { Badge, Page, SectionHeader } from "@kosmeo-ui/react";
import type { QueryClient } from "@tanstack/react-query";

export const clientLoader = (queryClient: QueryClient) => async () => {
  await Promise.all([
    queryClient.ensureQueryData(getStatsQueryOptions()),
    queryClient.ensureQueryData(getRecentCustomersQueryOptions()),
  ]);
  return null;
};

const DashboardRoute = () => (
  <Page padded gap="md" maxWidth="wide">
    <SectionHeader
      as="h1"
      title="Dashboard"
      subtitle="A snapshot of the demo workspace"
      badges={
        <Badge variant="primary" subtle>
          Demo data
        </Badge>
      }
    />
    <WelcomeBanner />
    <StatsOverview />
    <RecentCustomers />
    <WorkspaceSetup />
  </Page>
);

export default DashboardRoute;
