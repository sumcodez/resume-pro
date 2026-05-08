import { NextResponse } from "next/server";

import { getErrorMessage, getErrorStatus } from "@/lib/auth/http";
import { createAuthSession } from "@/lib/auth/session";
import { signupUser } from "@/lib/auth/service";
import { signupSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = signupSchema.parse(body);
    const result = await signupUser(input);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message },
        { status: result.status }
      );
    }

    await createAuthSession(result.user);

    return NextResponse.json(
      {
        message: "Your account is ready.",
        user: result.user,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: getErrorStatus(error) }
    );
  }
}
