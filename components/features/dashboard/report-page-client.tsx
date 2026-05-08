"use client";

import Link from "next/link";
import { useState } from "react";
import { FileSearch, RotateCcw } from "lucide-react";

import {
  AtsResultsDashboard,
  type AtsAnalysis,
} from "@/components/features/dashboard/ats-results-dashboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const REPORT_STORAGE_KEY = "resume-report-analysis";

export function ReportPageClient() {
  const [analysis] = useState<AtsAnalysis | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const stored = sessionStorage.getItem(REPORT_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as AtsAnalysis;
    } catch {
      sessionStorage.removeItem(REPORT_STORAGE_KEY);
      return null;
    }
  });

  if (!analysis) {
    return (
      <Card className="mx-auto max-w-3xl border-border/70">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <FileSearch className="size-6" />
          </div>
          <CardTitle className="mt-4 text-2xl">No report available yet</CardTitle>
          <CardDescription>
            Analyze a resume first, then your complete report will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild className="rounded-2xl">
            <Link href="/dashboard">
              <RotateCcw className="size-4" />
              Go to dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-border/70 bg-background/90 p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Resume report</p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Complete ATS analysis
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Review the score, keyword coverage, and recommendations in one
            focused report.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-2xl">
          <Link href="/dashboard">
            <RotateCcw className="size-4" />
            Analyze another resume
          </Link>
        </Button>
      </div>

      <AtsResultsDashboard analysis={analysis} />
    </section>
  );
}
