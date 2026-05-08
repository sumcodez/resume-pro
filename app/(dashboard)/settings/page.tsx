import { ProfileSettingsForm } from "@/components/features/settings/profile-settings-form";
import { requireSessionUser } from "@/lib/auth/session";
import { getDashboardUserById } from "@/lib/users/service";

export default async function SettingsPage() {
  const sessionUser = await requireSessionUser();
  const user = await getDashboardUserById(sessionUser.id);

  if (!user) {
    throw new Error("Authenticated user record not found.");
  }

  return (
    <section className="mx-auto w-full max-w-3xl">
      <ProfileSettingsForm user={user} />
    </section>
  );
}
