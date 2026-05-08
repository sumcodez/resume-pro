import { CheckCircle2, Sparkles } from "lucide-react";

import { UpgradeButton } from "@/components/features/billing/upgrade-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLAN_PRICING } from "@/lib/billing/plans";

type PricingSectionProps = {
  currentPlan: "free" | "pro";
};

const planCards = [
  {
    key: "free",
    title: "Free",
    price: PLAN_PRICING.free.priceLabel,
    description: "Best for trying resume analysis with a few focused scans.",
    features: [
      "2 scans included when you sign up",
      "1 scan per month after your starter scans",
      "ATS score and basic recommendations",
    ],
  },
  {
    key: "pro",
    title: "Pro",
    price: PLAN_PRICING.pro.priceLabel,
    description: "For users who review resumes regularly and need more scans.",
    features: [
      "4 scans per month",
      "Full AI recommendations",
      "Summary rewrite guidance",
    ],
  },
] as const;

export function PricingSection({ currentPlan }: PricingSectionProps) {
  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-border/70 bg-background p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Badge variant="secondary">Pricing</Badge>
            <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance">
              Simple plans for resume reviews.
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Start free, then upgrade when you need more scans and deeper
              improvement guidance.
            </p>
          </div>

          <Badge variant={currentPlan === "pro" ? "success" : "warning"}>
            Current plan: {currentPlan === "pro" ? "Pro" : "Free"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {planCards.map((plan) => {
          const isPro = plan.key === "pro";
          const isCurrent = currentPlan === plan.key;

          return (
            <Card
              key={plan.key}
              className={
                isPro
                  ? "relative overflow-hidden border-primary/30 shadow-lg shadow-primary/10"
                  : undefined
              }
            >
              {isPro ? (
                <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
              ) : null}

              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{plan.title}</CardTitle>
                  {isPro ? (
                    <Badge variant="success">
                      <Sparkles className="mr-1 size-3" />
                      Recommended
                    </Badge>
                  ) : null}
                </div>
                <div className="text-3xl font-semibold tracking-tight">
                  {plan.price}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid gap-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                      <span className="leading-6 text-muted-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {isCurrent ? (
                  <Button variant="outline" className="w-full rounded-2xl" disabled>
                    Current plan
                  </Button>
                ) : isPro ? (
                  <UpgradeButton currentPlan={currentPlan} fullWidth />
                ) : (
                  <Button variant="outline" className="w-full rounded-2xl" disabled>
                    Included
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
