import { NextResponse } from "next/server";

import { analyzeResume } from "@/lib/ai/analyze-resume";
import { generateAI } from "@/lib/ai/gemini";
import { getErrorMessage, getErrorStatus } from "@/lib/auth/http";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { authorizeAndConsumeScan, getUsageStatus } from "@/lib/usage/service";
import { analyzeSchema } from "@/lib/validations/analyze";

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json(
        { error: true, message: "Please sign in to analyze a resume." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        planType: true,
        scansUsed: true,
        lastScanDate: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: true, message: "We could not find your account." },
        { status: 404 }
      );
    }

    const usage = await getUsageStatus(user);

    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: true,
          message: "You have used all available scans.",
          usage,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const input = analyzeSchema.parse(body);
    const scoringAnalysis = await analyzeResume(input);
    const aiAnalysis = await getSafeAIAnalysis(input, scoringAnalysis);
    const updatedUsage = await authorizeAndConsumeScan(sessionUser.id);

    if (!updatedUsage) {
      return NextResponse.json(
        { error: true, message: "We could not find your account." },
        { status: 404 }
      );
    }

    if (!updatedUsage.allowed) {
      return NextResponse.json(
        {
          error: true,
          message: "You have used all available scans.",
          usage: updatedUsage,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      error: false,
      message: "Your resume report is ready.",
      analysis: {
        ...scoringAnalysis,
        ai: {
          missing_skills: aiAnalysis.missing_skills,
          improvements:
            aiAnalysis.improvements.length > 0
              ? aiAnalysis.improvements
              : scoringAnalysis.improvements,
          rewritten_summary: aiAnalysis.rewritten_summary,
        },
      },
      usage: updatedUsage,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: true,
        message: getErrorMessage(error),
      },
      { status: getErrorStatus(error) }
    );
  }
}

async function getSafeAIAnalysis(
  input: { resumeText: string; jobDescription: string },
  analysis: Awaited<ReturnType<typeof analyzeResume>>
) {
  try {
    return await generateAI(buildAIPrompt(input, analysis));
  } catch {
    return {
      missing_skills: [],
      improvements: [],
      rewritten_summary: "",
    };
  }
}

function buildAIPrompt(
  input: { resumeText: string; jobDescription: string },
  analysis: Awaited<ReturnType<typeof analyzeResume>>
) {
  return `
Resume text:
${input.resumeText}

Job description:
${input.jobDescription}

Current ATS scoring result:
- overall_score: ${analysis.overall_score}
- matched_keywords: ${analysis.matched_keywords.join(", ") || "none"}
- missing_keywords: ${analysis.missing_keywords.join(", ") || "none"}
- improvements: ${analysis.improvements.join(" | ")}

Generate ATS-focused coaching output.
`;
}
