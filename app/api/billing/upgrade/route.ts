import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { upgradeUserPlan } from "@/lib/usage/service";

export async function POST() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json(
      { error: true, message: "Please sign in to upgrade your plan." },
      { status: 401 }
    );
  }

  const user = await upgradeUserPlan(sessionUser.id);

  return NextResponse.json({
    error: false,
    message: "Your Pro plan is active.",
    user,
  });
}
