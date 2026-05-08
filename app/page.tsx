import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileSearch,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import { AppNavbar } from "@/components/common/app-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth/session";

const proofPoints = [
  "ATS-style score with clear category breakdowns",
  "Keyword coverage and skill gap insights",
  "Professional reports you can review and improve from",
];

const featureCards = [
  {
    title: "Clear ATS scoring",
    description:
      "See how well a resume matches the role with a weighted score and easy-to-read category feedback.",
    icon: Target,
  },
  {
    title: "Useful AI guidance",
    description:
      "Get strengths, missing keywords, and rewrite suggestions that help improve the resume quickly.",
    icon: Sparkles,
  },
  {
    title: "Fast resume review",
    description:
      "Upload a resume, generate a report, and return to your latest analysis whenever you need it.",
    icon: Zap,
  },
];

const statItems = [
  { value: "6", label: "score categories" },
  { value: "1", label: "dedicated report" },
  { value: "PDF", label: "file upload" },
  { value: "AI", label: "improvement guidance" },
];

const platformNotes = [
  {
    title: "Upload with ease",
    body: "Upload a PDF or DOCX resume and we will extract the text for review.",
    icon: FileSearch,
  },
  {
    title: "Understand the score",
    body: "Every report explains the score by category so users know what is working and what needs attention.",
    icon: Bot,
  },
  {
    title: "Review with confidence",
    body: "Your account keeps the experience organized with plan limits, saved report access, and a clean dashboard.",
    icon: ShieldCheck,
  },
];

export default async function HomePage() {
  const sessionUser = await getSessionUser();
  const primaryHref = sessionUser ? "/dashboard" : "/signup";
  const primaryLabel = sessionUser ? "Open dashboard" : "Get started";
  const secondaryHref = sessionUser ? "/report" : "/login";
  const secondaryLabel = sessionUser ? "View last report" : "Sign in";

  return (
    <main className="premium-page-bg min-h-screen">
      <section className="mx-auto flex w-full max-w-6xl flex-col px-6 pb-6 pt-28 sm:px-8 sm:pt-36 lg:px-10">
        <AppNavbar />

        <div className="grid gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <div className="space-y-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
                <CheckCircle2 className="size-4 text-emerald-600" />
                Built for focused resume reviews and role-specific improvements
              </div>

              <div className="space-y-4">
                <h2 className="max-w-4xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
                  AI resume analysis that turns feedback into clear next steps.
                </h2>
                <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                  Upload a resume, compare it with a job description, and get a
                  professional report with ATS scoring, keyword insights, and
                  practical recommendations.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-2xl px-6">
                  <Link href={primaryHref}>
                    {primaryLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-2xl px-6">
                  <Link href={secondaryHref}>
                    {secondaryLabel}
                    {sessionUser ? <LayoutDashboard className="size-4" /> : null}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {proofPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-[1.5rem] border border-border/70 bg-background/70 px-4 py-4 text-sm leading-6 text-muted-foreground shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_18px_45px_rgba(14,165,233,0.14)]"
                >
                  {point}
                </div>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden border-border/70 bg-[radial-gradient(circle_at_top_right,_color-mix(in_oklch,var(--primary)_18%,transparent),_transparent_32%),color-mix(in_oklch,var(--card)_94%,transparent)] shadow-xl">
            <CardContent className="space-y-6 p-6 sm:p-12">
              <div className="flex items-center justify-between rounded-[1.5rem] border border-border/70 bg-background/90 px-4 py-3">
                <div>
                  <p className="text-sm text-muted-foreground">Report preview</p>
                  <p className="text-lg font-semibold">Frontend Engineer Resume</p>
                </div>
                <div className="rounded-2xl bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                  84 / 100
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {statItems.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.5rem] border border-border/70 bg-background/85 px-4 py-4"
                  >
                    <p className="text-2xl font-semibold tracking-tight">{item.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950 px-5 py-5 text-slate-50 shadow-[0_20px_55px_rgba(14,165,233,0.20)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                  <p className="text-sm text-slate-400">Keyword coverage</p>
                    <p className="mt-1 text-xl font-semibold">Strong match</p>
                  </div>
                  <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200">
                    4 gaps
                  </div>
                </div>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl bg-white/6 px-4 py-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Skills match</span>
                      <span className="font-medium text-white">88%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/10">
                      <div className="h-2 w-[88%] rounded-full bg-emerald-400" />
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/6 px-4 py-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Semantic similarity</span>
                      <span className="font-medium text-white">79%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/10">
                      <div className="h-2 w-[79%] rounded-full bg-sky-400" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <section className="grid gap-5 py-4 md:grid-cols-3">
          {featureCards.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title} className="group bg-background/72 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_24px_70px_rgba(14,165,233,0.16)]">
                <CardContent className="space-y-4 p-6">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-foreground shadow-inner transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-8 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Why users like it
            </p>
            <h3 className="text-4xl font-semibold tracking-tight text-balance">
              Simple enough to use immediately, detailed enough to trust.
            </h3>
            <p className="max-w-xl text-base leading-8 text-muted-foreground">
              The workflow stays focused from upload to final report, helping
              users understand the result and make better resume edits.
            </p>
          </div>

          <div className="grid gap-4">
            {platformNotes.map((note) => {
              const Icon = note.icon;

              return (
                <div
                  key={note.title}
                  className="flex gap-4 rounded-[1.75rem] border border-border/70 bg-background/72 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_20px_55px_rgba(14,165,233,0.14)]"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted">
                    <Icon className="size-5" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold tracking-tight">{note.title}</h4>
                    <p className="text-sm leading-7 text-muted-foreground">{note.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="pb-10">
          <Card className="overflow-hidden border-border/70 bg-[linear-gradient(135deg,_rgba(15,23,42,1),_rgba(30,41,59,0.96))] text-white shadow-xl">
            <CardContent className="flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-300">
                  Ready to review
                </p>
                <h3 className="text-3xl font-semibold tracking-tight text-balance">
                  Start improving resumes with clear ATS-focused feedback.
                </h3>
                <p className="text-sm leading-7 text-slate-300">
                  Create an account, upload a resume, and generate your first
                  report in minutes.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100">
                  <Link href={primaryHref}>
                    {primaryLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10"
                >
                  <Link href={secondaryHref}>{secondaryLabel}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </section>
    </main>
  );
}
