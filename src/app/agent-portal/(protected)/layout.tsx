import { AgentShell } from "@/components/agent/AgentShell";

export default function AgentPortalProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AgentShell>{children}</AgentShell>;
}
