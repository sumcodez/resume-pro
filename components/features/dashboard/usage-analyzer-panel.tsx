"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  CheckCircle2,
  FileSearch,
  FileText,
  Sparkles,
  Target,
} from "lucide-react";

import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { UpgradeButton } from "@/components/features/billing/upgrade-button";
import type { AtsAnalysis } from "@/components/features/dashboard/ats-results-dashboard";
import { ResumeUploadCard } from "@/components/features/dashboard/resume-upload-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import type { UsageLimitResult } from "@/lib/usage/check-usage-limit";
import { cn } from "@/lib/utils";

type UsageAnalyzerPanelProps = {
  usage: UsageLimitResult;
  currentPlan: "free" | "pro";
};

type AnalysisResponse = {
  error: boolean;
  message: string;
  analysis?: AtsAnalysis;
  usage?: UsageLimitResult;
};

const REPORT_STORAGE_KEY = "resume-report-analysis";

const ANALYSIS_STAGES = [
  {
    key: "validating",
    label: "Checking your scan",
    description: "Confirming your plan access and request details.",
    progress: 18,
    icon: CheckCircle2,
  },
  {
    key: "parsing",
    label: "Reading the resume",
    description: "Preparing the resume text for a clean review.",
    progress: 36,
    icon: FileText,
  },
  {
    key: "matching",
    label: "Matching the role",
    description: "Comparing the resume with the target job description.",
    progress: 56,
    icon: Target,
  },
  {
    key: "scoring",
    label: "Calculating the score",
    description: "Reviewing category scores and keyword coverage.",
    progress: 76,
    icon: FileSearch,
  },
  {
    key: "ai",
    label: "Preparing recommendations",
    description: "Creating improvement suggestions and rewrite guidance.",
    progress: 92,
    icon: Sparkles,
  },
] as const;

type FlowStage =
  | "idle"
  | "uploading"
  | "ready"
  | (typeof ANALYSIS_STAGES)[number]["key"]
  | "complete";

export function UsageAnalyzerPanel({
  usage,
  currentPlan,
}: UsageAnalyzerPanelProps) {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [flowStage, setFlowStage] = useState<FlowStage>("idle");
  const [blockedOpen, setBlockedOpen] = useState(false);
  const [isUpgradePending, setIsUpgradePending] = useState(false);
  const [liveUsage, setLiveUsage] = useState(usage);
  const hasLastReport = useSyncExternalStore(
    () => () => {},
    () => sessionStorage.getItem(REPORT_STORAGE_KEY) !== null,
    () => false
  );

  const analysisStageIndex = ANALYSIS_STAGES.findIndex(
    (step) => step.key === flowStage
  );
  const currentAnalysisStage =
    analysisStageIndex >= 0 ? ANALYSIS_STAGES[analysisStageIndex] : null;
  const progressValue =
    flowStage === "complete" ? 100 : currentAnalysisStage?.progress ?? 0;

  const statusTone = useMemo(() => {
    if (!liveUsage.allowed) {
      return "destructive" as const;
    }

    if (liveUsage.remaining_scans <= 1) {
      return "warning" as const;
    }

    return "default" as const;
  }, [liveUsage]);

  useEffect(() => {
    if (!isPending) {
      return;
    }

    const timers = ANALYSIS_STAGES.slice(1).map((stage, index) =>
      window.setTimeout(() => {
        setFlowStage(stage.key);
      }, 1100 + index * 1250)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [isPending]);

  async function handleAnalyze() {
    setIsPending(true);
    setFlowStage("validating");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      const data = (await response.json()) as AnalysisResponse;

      if (!response.ok || data.error) {
        toast.error("Scan unavailable", {
          description: data.message,
        });

        if (response.status === 403) {
          setBlockedOpen(true);
        }

        if (data.usage) {
          setLiveUsage(data.usage);
        }

        setFlowStage("ready");
        return;
      }

      if (data.usage) {
        setLiveUsage(data.usage);
      }

      if (data.analysis) {
        sessionStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(data.analysis));
      }

      setResumeText("");
      setJobDescription("");
      setFlowStage("complete");
      toast.success(data.message ?? "Your resume report is ready.");
      router.push("/report");
    } catch {
      toast.error("Analysis could not be completed", {
        description: "Please try again in a moment.",
      });
      setFlowStage("ready");
    } finally {
      setIsPending(false);
    }
  }

  async function handleUpgrade() {
    setIsUpgradePending(true);

    try {
      const response = await fetch("/api/billing/upgrade", {
        method: "POST",
      });
      const data = (await response.json()) as {
        error?: boolean;
        message?: string;
      };

      if (!response.ok || data.error) {
        toast.error("Upgrade could not be completed", {
          description: data.message ?? "Please try again in a moment.",
        });
        return;
      }

      setBlockedOpen(false);
      toast.success(data.message ?? "Your Pro plan is active.");
      router.refresh();
      router.push("/pricing");
    } catch {
      toast.error("Upgrade could not be completed", {
        description: "Please try again in a moment.",
      });
    } finally {
      setIsUpgradePending(false);
    }
  }

  return (
    <>
      <ConfirmationModal
        open={blockedOpen}
        onOpenChange={setBlockedOpen}
        onConfirm={handleUpgrade}
        title="You have used all available scans"
        description="Upgrade to Pro to continue reviewing resumes this month."
        confirmLabel="Upgrade to Pro"
        cancelLabel="Not now"
        variant="destructive"
        isPending={isUpgradePending}
      >
        <p className="rounded-2xl bg-muted/60 px-4 py-3 text-sm leading-6 text-muted-foreground">
          Pro includes 4 scans per month for Rs. 200 and refreshes your scan
          access immediately.
        </p>
      </ConfirmationModal>

      <Card className="border-border/70 bg-background/90">
        <CardContent className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={statusTone}>
              {liveUsage.remaining_scans} scan
              {liveUsage.remaining_scans === 1 ? "" : "s"} left
            </Badge>
            <div className="rounded-full border border-border/70 bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground">
              Plan: <span className="font-medium capitalize text-foreground">{currentPlan}</span>
            </div>
            <p className="text-sm text-muted-foreground">{liveUsage.message}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {hasLastReport ? (
              <Button
                variant="outline"
                className="rounded-2xl cursor-pointer"
                onClick={() => router.push("/report")}
              >
                <FileSearch className="size-4" />
                Open latest report
              </Button>
            ) : null}
            {currentPlan === "free" ? (
              <UpgradeButton currentPlan={currentPlan} />
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <div className="grid gap-6">
          <ResumeUploadCard
            onExtracted={(text) => {
              setResumeText(text);
              setFlowStage("ready");
            }}
            onUploadStateChange={(state) => {
              setFlowStage(
                state === "uploading"
                  ? "uploading"
                  : state === "done"
                    ? "ready"
                    : "idle"
              );
            }}
          />

          <Card className="border-border/70">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Analyze a resume</CardTitle>
                  <CardDescription>
                    Add the resume and job description to generate a clear ATS
                    report.
                  </CardDescription>
                </div>
                <Badge variant={statusTone}>
                  {liveUsage.remaining_scans} scan
                  {liveUsage.remaining_scans === 1 ? "" : "s"} left
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {isPending ? (
                <div className="grid gap-3 rounded-[1.25rem] border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-primary p-2 text-primary-foreground">
                        <Sparkles className="size-4 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {currentAnalysisStage?.label ?? "Analyzing resume"}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {currentAnalysisStage?.description ??
                            "Preparing your ATS report."}
                        </p>
                      </div>
                    </div>
                    <Badge variant="warning">{progressValue}%</Badge>
                  </div>
                  <Progress
                    value={progressValue}
                    className="h-2 bg-background"
                    indicatorClassName={cn("bg-primary", "animate-pulse")}
                  />
                </div>
              ) : null}

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="resumeText">Resume text</Label>
                  <textarea
                    id="resumeText"
                    className="min-h-44 rounded-[1.5rem] border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                    placeholder="Paste the resume text here, or upload a file above."
                    value={resumeText}
                    onChange={(event) => setResumeText(event.target.value)}
                    disabled={isPending}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="jobDescription">Job description</Label>
                  <textarea
                    id="jobDescription"
                    className="min-h-44 rounded-[1.5rem] border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                    placeholder="Paste the job description for the role you are targeting."
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                    disabled={isPending}
                  />
                </div>
              </div>

              <Button
                className="h-12 rounded-2xl"
                disabled={
                  isPending ||
                  resumeText.trim().length < 50 ||
                  jobDescription.trim().length < 50
                }
                onClick={() => {
                  void handleAnalyze();
                }}
              >
                {isPending
                  ? `${currentAnalysisStage?.label ?? "Analyzing"}...`
                  : "Analyze resume"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

    </>
  );
}
