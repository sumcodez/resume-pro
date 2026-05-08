import { prisma } from "@/lib/prisma";
import { checkUsageLimit } from "@/lib/usage/check-usage-limit";

type UserUsageSelect = {
  id: string;
  planType: "free" | "pro";
  scansUsed: number;
  lastScanDate: Date | null;
};

export async function getUsageStatus(user: UserUsageSelect, now = new Date()) {
  const result = checkUsageLimit(user, now);

  if (result.shouldReset) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        scansUsed: result.normalizedScansUsed,
      },
    });
  }

  return result;
}

export async function consumeScan(user: UserUsageSelect, now = new Date()) {
  const result = checkUsageLimit(user, now);

  if (!result.allowed) {
    return result;
  }

  const nextScansUsed = result.normalizedScansUsed + 1;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      scansUsed: nextScansUsed,
      lastScanDate: now,
    },
  });

  return {
    ...result,
    remaining_scans: Math.max(result.remaining_scans - 1, 0),
    normalizedScansUsed: nextScansUsed,
  };
}

export async function authorizeAndConsumeScan(userId: string, now = new Date()) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        planType: true,
        scansUsed: true,
        lastScanDate: true,
      },
    });

    if (!user) {
      return null;
    }

    const result = checkUsageLimit(user, now);

    if (!result.allowed) {
      if (result.shouldReset) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            scansUsed: result.normalizedScansUsed,
          },
        });
      }

      return result;
    }

    const nextScansUsed = result.normalizedScansUsed + 1;

    await tx.user.update({
      where: { id: user.id },
      data: {
        scansUsed: nextScansUsed,
        lastScanDate: now,
      },
    });

    return {
      ...result,
      remaining_scans: Math.max(result.remaining_scans - 1, 0),
      normalizedScansUsed: nextScansUsed,
      shouldReset: false,
    };
  });
}

export async function upgradeUserPlan(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      planType: "pro",
      scansUsed: 0,
      lastScanDate: null,
    },
    select: {
      id: true,
      planType: true,
      scansUsed: true,
      lastScanDate: true,
    },
  });
}
