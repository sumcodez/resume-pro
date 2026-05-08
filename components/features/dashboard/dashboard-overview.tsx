'use client';
import { Brain, FileCheck, Sparkles, Users } from "lucide-react";

import { UpgradeButton } from "@/components/features/billing/upgrade-button";
import { UsageAnalyzerPanel } from "@/components/features/dashboard/usage-analyzer-panel";
import { Badge } from "@/components/ui/badge";
import { formatPercent } from "@/lib/utils";
import type { UsageLimitResult } from "@/lib/usage/check-usage-limit";
import { useEffect, useState } from "react";

type DashboardSnapshot = {
  scoreAccuracy: number;
  resumesReviewed: number;
  activeCandidates: number;
  automationRate: number;
  highlights: string[];
};

type DashboardOverviewProps = {
  snapshot: DashboardSnapshot;
  user: {
    id: string;
    name: string;
    email: string;
    planType: "free" | "pro";
  };
  usage: UsageLimitResult;
};

const statCards = [
  {
    key: "scoreAccuracy",
    label: "Score confidence",
    icon: Brain,
    formatter: formatPercent,
  },
  {
    key: "resumesReviewed",
    label: "Resumes reviewed",
    icon: FileCheck,
    formatter: (value: number) => value.toLocaleString(),
  },
  {
    key: "activeCandidates",
    label: "Active candidates",
    icon: Users,
    formatter: (value: number) => value.toLocaleString(),
  },
  {
    key: "automationRate",
    label: "Review efficiency",
    icon: Sparkles,
    formatter: formatPercent,
  },
] satisfies Array<{
  key: keyof Omit<DashboardSnapshot, "highlights">;
  label: string;
  icon: typeof Brain;
  formatter: (value: number) => string;
}>;

export function DashboardOverview({
  snapshot,
  user,
  usage,
}: DashboardOverviewProps) {
  function useCountUp(target: number, duration = 1600, delay = 0) {
    const [value, setValue] = useState(0);

    useEffect(() => {
      const timeout = setTimeout(() => {
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
          setValue(target * ease);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, delay);
      return () => clearTimeout(timeout);
    }, [target, duration, delay]);

    return value;
  }

  function StatCard({
    card,
    value,
    delay,
  }: {
    card: (typeof statCards)[0];
    value: number;
    delay: number;
  }) {
    const animated = useCountUp(value, 1600, delay);
    const Icon = card.icon;
    return (
      <article className="rounded-[1.75rem] border border-border/70 bg-background p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            {card.label}
          </p>
          <div className="rounded-2xl bg-muted p-2 text-muted-foreground">
            <Icon className="size-4" />
          </div>
        </div>
        <p className="mt-6 text-3xl font-semibold tracking-tight">
          {card.formatter(animated)}
        </p>
      </article>
    );
  }

  return (
    <section className="space-y-8">
      <div className="grid gap-5 rounded-[2rem] border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.1),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.1),_transparent_30%),rgba(255,255,255,0.96)] p-8 shadow-sm lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">Dashboard</Badge>
            <Badge variant={user.planType === "pro" ? "success" : "warning"}>
              {user.planType === "pro" ? "Pro plan" : "Free plan"}
            </Badge>
          </div>
          <div className="space-y-3">
            <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance">
              Welcome back, {user.name}. Review each resume with a cleaner ATS
              score, stronger keyword insights, and practical next steps.
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Signed in as {user.email}. Upload a resume, compare it with a
              target role, and get recommendations that are easy to apply.
            </p>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-border/70 bg-background/80 p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Remaining scans
          </p>
          <p className="mt-3 text-4xl font-semibold tracking-tight">
            {usage.remaining_scans}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {usage.message}
          </p>
          {user.planType === "free" ? (
            <div className="mt-5">
              <UpgradeButton currentPlan={user.planType} fullWidth />
            </div>
          ) : null}
        </div>
      </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, i) => (
          <StatCard
            key={card.key}
            card={card}
            value={snapshot[card.key]}
            delay={i * 100}
          />
        ))}
      </div>

      <UsageAnalyzerPanel usage={usage} currentPlan={user.planType} />

      <article className="rounded-[2rem] border border-border/70 bg-background p-8 shadow-sm">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight">
            Recommended focus areas
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Prioritize the changes most likely to improve ATS alignment and role
            fit.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {snapshot.highlights.map((highlight) => (
            <div
              key={highlight}
              className="rounded-[1.5rem] bg-muted/60 p-5 text-sm leading-6 text-muted-foreground"
            >
              {highlight}
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
