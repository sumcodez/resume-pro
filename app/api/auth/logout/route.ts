import { NextResponse } from "next/server";

import { clearAuthSession } from "@/lib/auth/session";

export async function POST() {
  await clearAuthSession();

  return NextResponse.json({ message: "You have been signed out." });
}
