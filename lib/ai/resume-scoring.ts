type ResumeScoringSnapshot = {
  scoreAccuracy: number;
  resumesReviewed: number;
  activeCandidates: number;
  automationRate: number;
  highlights: string[];
};

export async function getResumeScoringSnapshot(): Promise<ResumeScoringSnapshot> {
  return {
    scoreAccuracy: 0.94,
    resumesReviewed: 1248,
    activeCandidates: 86,
    automationRate: 0.71,
    highlights: [
      "Tailor the resume summary and skills section to match the role more closely.",
      "Add measurable outcomes to experience bullets wherever possible.",
      "Review missing keywords before sending the resume to an ATS or recruiter.",
    ],
  };
}
