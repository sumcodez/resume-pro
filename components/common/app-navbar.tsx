import Link from "next/link";
import { ArrowRight, LayoutDashboard, Settings, Sparkles } from "lucide-react";

import { LogoutButton } from "@/components/common/logout-button";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth/session";

type AppNavbarProps = {
  className?: string;
};

export async function AppNavbar({ className }: AppNavbarProps) {
  const sessionUser = await getSessionUser();

  return (
    <div className="fixed top-4 left-0 right-0 z-50">
      <div className="max-w-292 mx-auto px-6 sm:px-8 lg:px-10">
        <header
          className={`group relative overflow-hidden rounded-[2rem] border border-white/35 bg-white/72 px-5 py-4 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_30px_95px_rgba(14,165,233,0.18)] dark:border-white/10 dark:bg-slate-950/58 dark:shadow-[0_24px_90px_rgba(0,0,0,0.35)] sm:px-6 sm:py-5 ${className ?? ""}`}
        >
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
          <div className="pointer-events-none absolute -left-20 -top-20 size-44 rounded-full bg-cyan-300/18 blur-3xl transition-opacity duration-300 group-hover:opacity-90" />
          <div className="pointer-events-none absolute -right-16 top-4 size-36 rounded-full bg-fuchsia-300/12 blur-3xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Link
              href={sessionUser ? "/dashboard" : "/"}
              className="flex items-center gap-3 rounded-3xl outline-none transition-transform hover:scale-[1.01] focus-visible:ring-3 focus-visible:ring-ring/30"
            >
              <div className="relative flex size-11 items-center justify-center overflow-hidden rounded-2xl bg-slate-950 text-white shadow-[0_0_30px_rgba(14,165,233,0.35)] dark:bg-white dark:text-slate-950">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/40 via-transparent to-fuchsia-400/35" />
                <Sparkles className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Resume Score
                </p>
                <h1 className="text-lg font-semibold tracking-tight">
                  AI Resume Review
                </h1>
              </div>
            </Link>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <ThemeToggle />
              {sessionUser ? (
                <>
                  <Button asChild variant="ghost">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link href="/pricing">Pricing</Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link href="/settings">
                      <Settings className="size-4" />
                      Settings
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/report">
                      <LayoutDashboard className="size-4" />
                      Latest report
                    </Link>
                  </Button>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Button asChild variant="ghost">
                    <Link href="/">Overview</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">
                      Get started
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>
      </div>
    </div>
  );
}
