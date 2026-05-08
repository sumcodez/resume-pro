import type { ReactNode } from "react";

import { AppNavbar } from "@/components/common/app-navbar";

type AuthShellProps = {
  children: ReactNode;
};

export async function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_58%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_58%,transparent)_1px,transparent_1px)] bg-[size:44px_44px] opacity-35 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_76%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-primary/18 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-36 size-80 rounded-full bg-accent/28 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-12 size-96 rounded-full bg-chart-1/12 blur-3xl" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pb-10 pt-44 sm:px-8 sm:pt-40 md:pt-32 lg:px-10">
        <AppNavbar />

        <div className="flex flex-1 items-start justify-center md:items-center">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </section>
    </main>
  );
}
