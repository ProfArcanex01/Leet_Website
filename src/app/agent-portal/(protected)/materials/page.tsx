"use client";

import { AgentPortalState, MaterialsSection, useAgentPortalData } from "@/components/agent/portal-sections";

export default function AgentPortalMaterialsPage() {
  const { materials, loading, error, progressUpdates, updateMaterialProgress } = useAgentPortalData();

  return (
    <AgentPortalState loading={loading} error={error}>
      <MaterialsSection
        materials={materials}
        progressUpdates={progressUpdates}
        updateMaterialProgress={updateMaterialProgress}
      />
    </AgentPortalState>
  );
}
