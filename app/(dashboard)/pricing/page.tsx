import { PricingSection } from "@/components/features/billing/pricing-section";
import { requireSessionUser } from "@/lib/auth/session";
import { getDashboardUserById } from "@/lib/users/service";

export default async function PricingPage() {
  const sessionUser = await requireSessionUser();
  const user = await getDashboardUserById(sessionUser.id);

  if (!user) {
    throw new Error("Authenticated user record not found.");
  }

  return <PricingSection currentPlan={user.planType} />;
}
