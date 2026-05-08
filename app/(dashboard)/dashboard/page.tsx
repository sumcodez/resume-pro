import { DashboardOverview } from "@/components/features/dashboard/dashboard-overview";
import { getResumeScoringSnapshot } from "@/lib/ai/resume-scoring";
import { requireSessionUser } from "@/lib/auth/session";
import { getUsageStatus } from "@/lib/usage/service";
import { getDashboardUserById } from "@/lib/users/service";

export default async function DashboardPage() {
  const sessionUser = await requireSessionUser();
  const user = await getDashboardUserById(sessionUser.id);

  if (!user) {
    throw new Error("Authenticated user record not found.");
  }

  const snapshot = await getResumeScoringSnapshot();
  const usage = await getUsageStatus(user);

  return <DashboardOverview snapshot={snapshot} user={user} usage={usage} />;
}
