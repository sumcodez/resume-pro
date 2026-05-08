import { NextResponse } from "next/server";

import { getErrorMessage, getErrorStatus } from "@/lib/auth/http";
import { createAuthSession } from "@/lib/auth/session";
import { loginUser } from "@/lib/auth/service";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = loginSchema.parse(body);
    const result = await loginUser(input);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message },
        { status: result.status }
      );
    }

    await createAuthSession(result.user);

    return NextResponse.json({
      message: "Welcome back.",
      user: result.user,
    });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: getErrorStatus(error) }
    );
  }
}
