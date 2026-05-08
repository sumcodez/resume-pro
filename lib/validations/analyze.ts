import { z } from "zod";

export const analyzeSchema = z.object({
  resumeText: z
    .string()
    .trim()
    .min(50, "Add at least 50 characters of resume text."),
  jobDescription: z
    .string()
    .trim()
    .min(50, "Add at least 50 characters of job description."),
});

export type AnalyzeInput = z.infer<typeof analyzeSchema>;
