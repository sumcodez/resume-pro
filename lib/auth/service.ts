import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { LoginInput, SignupInput } from "@/lib/validations/auth";

type AuthResult =
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

export async function signupUser(input: SignupInput): Promise<AuthResult> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existingUser) {
    return {
      ok: false,
      status: 409,
      message: "An account already exists for this email address.",
    };
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: input.email,
      passwordHash,
      planType: "free",
      scansUsed: 0,
      lastScanDate: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return {
    ok: true,
    user,
  };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return {
      ok: false,
      status: 401,
      message: "The email or password is incorrect.",
    };
  }

  const passwordMatches = await verifyPassword(input.password, user.passwordHash);

  if (!passwordMatches) {
    return {
      ok: false,
      status: 401,
      message: "The email or password is incorrect.",
    };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}
