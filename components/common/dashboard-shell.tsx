import type { ReactNode } from "react";

import { AppNavbar } from "@/components/common/app-navbar";

type DashboardShellProps = {
  children: ReactNode;
};

export async function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="premium-page-bg min-h-screen">
      <AppNavbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col px-6 pt-28 pb-6 sm:px-8 lg:px-10">
        <div className="py-8">{children}</div>
      </main>
    </div>
  );
}
