"use client";

import { AgentPortalState, DashboardSection, useAgentPortalData } from "@/components/agent/portal-sections";

export default function AgentPortalHomePage() {
  const { dashboard, loading, error } = useAgentPortalData();

  return (
    <AgentPortalState loading={loading} error={error}>
      {dashboard ? <DashboardSection dashboard={dashboard} /> : null}
    </AgentPortalState>
  );
}
