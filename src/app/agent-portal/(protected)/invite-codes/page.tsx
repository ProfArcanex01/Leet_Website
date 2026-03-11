"use client";

import { AgentPortalState, InviteCodesSection, useAgentPortalData } from "@/components/agent/portal-sections";

export default function AgentPortalInviteCodesPage() {
  const { dashboard, loading, error } = useAgentPortalData();

  return (
    <AgentPortalState loading={loading} error={error}>
      {dashboard ? <InviteCodesSection inviteCodes={dashboard.invite_codes} /> : null}
    </AgentPortalState>
  );
}
