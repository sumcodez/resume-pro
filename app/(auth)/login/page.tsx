import { redirect } from "next/navigation";

import { AuthForm } from "@/components/features/auth/auth-form";
import { getSessionUser } from "@/lib/auth/session";

export default async function LoginPage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/dashboard");
  }

  return <AuthForm mode="login" />;
}
