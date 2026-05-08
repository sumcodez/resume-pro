import { BrainCircuit, CheckCircle2, CircleAlert, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type BreakdownKey =
  | "skills_match"
  | "semantic_similarity"
  | "experience_relevance"
  | "keyword_density"
  | "formatting"
  | "education";

export type AtsAnalysis = {
  overall_score: number;
  explanation: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  matched_keywords: string[];
  missing_keywords: string[];
  ai: {
    missing_skills: string[];
    improvements: string[];
    rewritten_summary: string;
  };
  breakdown: Record<
    BreakdownKey,
    {
      label: string;
      weight: number;
      score: number;
      weightedScore: number;
      explanation: string;
    }
  >;
};

type AtsResultsDashboardProps = {
  analysis: AtsAnalysis;
};

export function AtsResultsDashboard({
  analysis,
}: AtsResultsDashboardProps) {
  const breakdownItems = Object.entries(analysis.breakdown) as Array<
    [
      BreakdownKey,
      {
        label: string;
        weight: number;
        score: number;
        weightedScore: number;
        explanation: string;
      },
    ]
  >;

  const scoreTone =
    analysis.overall_score >= 80
      ? "success"
      : analysis.overall_score >= 60
        ? "warning"
        : "destructive";

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_30%),rgba(255,255,255,0.96)]">
        <CardHeader>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge variant={scoreTone}>ATS report</Badge>
              <CardTitle className="max-w-2xl">
                Resume match score with a clear ATS breakdown
              </CardTitle>
              <CardDescription className="max-w-2xl">
                {analysis.explanation}
              </CardDescription>
            </div>

            <div className="min-w-[220px] rounded-[1.75rem] border border-border/70 bg-background/90 p-6 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">
                Overall score
              </p>
              <div className="mt-3 flex items-end gap-3">
                <p className="text-5xl font-semibold tracking-tight">
                  {analysis.overall_score}
                </p>
                <span className="pb-1 text-sm text-muted-foreground">/100</span>
              </div>
              <Progress
                value={analysis.overall_score}
                className="mt-5 h-3"
                indicatorClassName={
                  analysis.overall_score >= 80
                    ? "bg-emerald-500"
                    : analysis.overall_score >= 60
                      ? "bg-amber-500"
                      : "bg-rose-500"
                }
              />
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {analysis.summary}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <BrainCircuit className="size-5 text-primary" />
              <div>
                <CardTitle className="text-2xl">Score breakdown</CardTitle>
                <CardDescription>
                  Each category contributes to the final resume match score.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {breakdownItems.map(([key, item]) => (
              <div
                key={key}
                className="rounded-[1.5rem] border border-border/70 bg-background px-5 py-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Weight: {item.weight}%
                    </p>
                  </div>
                  <Badge
                    variant={
                      item.score >= 75
                        ? "success"
                        : item.score >= 55
                          ? "warning"
                          : "destructive"
                    }
                  >
                    {item.score}%
                  </Badge>
                </div>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-3xl font-semibold tracking-tight">
                      {item.weightedScore}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      weighted impact
                    </p>
                  </div>
                  <div className="w-24">
                    <Progress
                      value={item.score}
                      className="h-2.5"
                      indicatorClassName={
                        item.score >= 75
                          ? "bg-emerald-500"
                          : item.score >= 55
                            ? "bg-amber-500"
                            : "bg-rose-500"
                      }
                    />
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.explanation}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Keyword match</CardTitle>
              <CardDescription>
                Covered keywords are shown in green. Missing keywords are shown
                in red.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-emerald-900">
                      Matched keywords
                    </p>
                    <span className="text-sm font-semibold text-emerald-700">
                      {analysis.matched_keywords.length}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {analysis.matched_keywords.length > 0 ? (
                      analysis.matched_keywords.map((keyword) => (
                        <Badge key={keyword} variant="success" className="px-3 py-1.5">
                          {keyword}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-emerald-800/80">
                        No strong keyword matches were found yet.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-rose-900">
                      Missing keywords
                    </p>
                    <span className="text-sm font-semibold text-rose-700">
                      {analysis.missing_keywords.length}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {analysis.missing_keywords.length > 0 ? (
                      analysis.missing_keywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          variant="destructive"
                          className="px-3 py-1.5"
                        >
                          {keyword}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-rose-800/80">
                        No major keyword gaps were detected.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Recommendations</CardTitle>
                  <CardDescription>
                    Strengths to keep, improvements to make, and a suggested
                    summary rewrite.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              {analysis.ai.rewritten_summary ? (
                <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 size-4 text-sky-600" />
                    <div>
                      <p className="text-sm font-medium text-sky-900">
                        Suggested summary
                      </p>
                      <p className="mt-2 text-sm leading-6 text-sky-900">
                        {analysis.ai.rewritten_summary}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {analysis.strengths.length > 0 ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {analysis.strengths.map((item) => (
                    <div
                      key={item}
                      className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-4"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />
                        <p className="text-sm leading-6 text-emerald-800">{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-border/70 bg-muted/40 px-4 py-4 text-sm leading-6 text-muted-foreground">
                  No standout strengths were detected yet. Improving the weaker
                  categories below should raise the match score.
                </div>
              )}

              <div className="grid gap-4 xl:grid-cols-2">
                {analysis.ai.improvements.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4"
                  >
                    <div className="flex items-start gap-3">
                      <CircleAlert className="mt-0.5 size-4 text-amber-600" />
                      <p className="text-sm leading-6 text-amber-900">{item}</p>
                    </div>
                  </div>
                ))}
              </div>

              {analysis.ai.missing_skills.length > 0 ? (
                <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-4">
                  <p className="text-sm font-medium text-rose-900">
                    Skills to consider adding
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {analysis.ai.missing_skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="destructive"
                        className="px-3 py-1.5"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
