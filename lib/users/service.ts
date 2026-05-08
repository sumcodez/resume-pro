import { prisma } from "@/lib/prisma";

export async function getDashboardUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      planType: true,
      scansUsed: true,
      lastScanDate: true,
      createdAt: true,
    },
  });
}

type ProfileUpdateInput = {
  name: string;
  email: string;
};

type ProfileUpdateResult =
  | {
      ok: true;
      user: {
        id: string;
        name: string;
        email: string;
      };
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

export async function updateUserProfile(
  userId: string,
  input: ProfileUpdateInput
): Promise<ProfileUpdateResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });

  if (!user) {
    return {
      ok: false,
      status: 404,
      message: "We could not find your account.",
    };
  }

  if (input.email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (existingUser) {
      return {
        ok: false,
        status: 409,
        message: "Another account already uses this email address.",
      };
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name.trim(),
      email: input.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return {
    ok: true,
    user: updatedUser,
  };
}
