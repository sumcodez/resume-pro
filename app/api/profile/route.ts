import { NextResponse } from "next/server";

import { getErrorMessage, getErrorStatus } from "@/lib/auth/http";
import { createAuthSession, getSessionUser } from "@/lib/auth/session";
import { updateUserProfile } from "@/lib/users/service";
import { profileSchema } from "@/lib/validations/auth";

export async function PATCH(request: Request) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json(
        { error: "Please sign in to update your profile." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const input = profileSchema.parse(body);
    const result = await updateUserProfile(sessionUser.id, input);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message },
        { status: result.status }
      );
    }

    await createAuthSession(result.user);

    return NextResponse.json({
      message: "Profile settings updated.",
      user: result.user,
    });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: getErrorStatus(error) }
    );
  }
}
