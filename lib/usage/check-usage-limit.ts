import type { UserModel } from "@/generated/prisma/models/User";
import type { PlanType } from "@/lib/billing/plans";
import { PLAN_PRICING } from "@/lib/billing/plans";

export type UsageUser = Pick<
  UserModel,
  "planType" | "scansUsed" | "lastScanDate"
>;

export type UsageLimitResult = {
  allowed: boolean;
  remaining_scans: number;
  message: string;
  normalizedScansUsed: number;
  shouldReset: boolean;
  planType: PlanType;
};

function isNewMonth(lastScanDate: Date | null, now: Date) {
  if (!lastScanDate) {
    return false;
  }

  return (
    lastScanDate.getUTCFullYear() !== now.getUTCFullYear() ||
    lastScanDate.getUTCMonth() !== now.getUTCMonth()
  );
}

export function checkUsageLimit(
  user: UsageUser,
  now = new Date()
): UsageLimitResult {
  const planType = user.planType;
  const scansUsed = user.scansUsed;
  const monthRolledOver = isNewMonth(user.lastScanDate ?? null, now);

  if (planType === "free") {
    if (scansUsed < PLAN_PRICING.free.initialScans) {
      return {
        allowed: true,
        remaining_scans: PLAN_PRICING.free.initialScans - scansUsed,
        message:
          scansUsed === 1
            ? "You have 1 starter scan remaining."
            : "Your free scans are ready to use.",
        normalizedScansUsed: scansUsed,
        shouldReset: false,
        planType,
      };
    }

    if (monthRolledOver) {
      return {
        allowed: true,
        remaining_scans: 1,
        message: "Your monthly free scan is available.",
        normalizedScansUsed: 0,
        shouldReset: true,
        planType,
      };
    }

    return {
      allowed: false,
      remaining_scans: 0,
      message: "You have used all available free scans.",
      normalizedScansUsed: scansUsed,
      shouldReset: false,
      planType,
    };
  }

  const normalizedScansUsed = monthRolledOver ? 0 : scansUsed;
  const remainingScans = Math.max(
    PLAN_PRICING.pro.monthlyScans - normalizedScansUsed,
    0
  );

  if (normalizedScansUsed < PLAN_PRICING.pro.monthlyScans) {
    return {
      allowed: true,
      remaining_scans: remainingScans,
      message:
        remainingScans <= 1
          ? "You are close to your monthly Pro limit."
          : "Your Pro scans are ready to use.",
      normalizedScansUsed,
      shouldReset: monthRolledOver,
      planType,
    };
  }

  return {
    allowed: false,
    remaining_scans: 0,
    message: "You have used all 4 Pro scans for this month.",
    normalizedScansUsed,
    shouldReset: false,
    planType,
  };
}

export function getUsageWarning(result: UsageLimitResult) {
  if (!result.allowed) {
    return "blocked" as const;
  }

  if (result.remaining_scans <= 1) {
    return "warning" as const;
  }

  return "healthy" as const;
}
