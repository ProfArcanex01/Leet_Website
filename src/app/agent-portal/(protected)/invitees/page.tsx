"use client";

import { AgentPortalState, InviteesSection, useAgentPortalData } from "@/components/agent/portal-sections";

export default function AgentPortalInviteesPage() {
  const { dashboard, invitees, loading, error } = useAgentPortalData();

  return (
    <AgentPortalState loading={loading} error={error}>
      {dashboard ? <InviteesSection dashboard={dashboard} invitees={invitees} /> : null}
    </AgentPortalState>
  );
}
