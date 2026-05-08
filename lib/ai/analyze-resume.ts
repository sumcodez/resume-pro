import type { AnalyzeInput } from "@/lib/validations/analyze";

type WeightedCategory =
  | "skills_match"
  | "semantic_similarity"
  | "experience_relevance"
  | "keyword_density"
  | "formatting"
  | "education";

type ScoreBreakdownItem = {
  label: string;
  weight: number;
  score: number;
  weightedScore: number;
  explanation: string;
};

export type ResumeAnalysis = {
  overall_score: number;
  explanation: string;
  breakdown: Record<WeightedCategory, ScoreBreakdownItem>;
  summary: string;
  strengths: string[];
  improvements: string[];
  matched_keywords: string[];
  missing_keywords: string[];
};

const CATEGORY_WEIGHTS = {
  skills_match: 0.3,
  semantic_similarity: 0.25,
  experience_relevance: 0.2,
  keyword_density: 0.1,
  formatting: 0.1,
  education: 0.05,
} as const;

const COMMON_STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "you",
  "your",
  "that",
  "this",
  "are",
  "from",
  "have",
  "has",
  "will",
  "into",
  "about",
  "their",
  "they",
  "them",
  "our",
  "not",
  "but",
  "can",
  "all",
  "any",
  "who",
  "his",
  "her",
  "she",
  "him",
  "how",
  "what",
  "when",
  "where",
  "why",
  "job",
  "role",
  "team",
  "work",
  "years",
  "year",
]);

const SKILL_TERMS = [
  "javascript",
  "typescript",
  "react",
  "next.js",
  "node.js",
  "python",
  "java",
  "sql",
  "postgresql",
  "mongodb",
  "aws",
  "docker",
  "kubernetes",
  "figma",
  "excel",
  "tableau",
  "power bi",
  "machine learning",
  "data analysis",
  "product management",
  "salesforce",
  "seo",
  "content strategy",
  "project management",
  "communication",
  "leadership",
  "agile",
  "scrum",
  "api",
  "rest",
  "graphql",
  "git",
];

const EDUCATION_TERMS = [
  "bachelor",
  "master",
  "degree",
  "b.tech",
  "m.tech",
  "bsc",
  "msc",
  "mba",
  "university",
  "college",
  "cgpa",
  "gpa",
  "education",
  "certification",
];

const EXPERIENCE_TERMS = [
  "experience",
  "worked",
  "led",
  "managed",
  "built",
  "developed",
  "delivered",
  "implemented",
  "improved",
  "launched",
  "designed",
  "optimized",
  "reduced",
  "increased",
  "collaborated",
  "intern",
  "engineer",
  "analyst",
  "manager",
  "specialist",
];

export async function analyzeResume(input: AnalyzeInput): Promise<ResumeAnalysis> {
  const resumeText = normalizeText(input.resumeText);
  const jobDescription = normalizeText(input.jobDescription);

  const resumeTokens = tokenize(resumeText);
  const jobTokens = tokenize(jobDescription);

  const resumeTokenSet = new Set(resumeTokens);
  const jobTokenSet = new Set(jobTokens);

  const matchedKeywords = getMatchedKeywords(resumeTokenSet, jobTokenSet);
  const missingKeywords = getMissingKeywords(resumeTokenSet, jobTokenSet);

  const skillsMatchScore = scoreSkillsMatch(resumeText, jobDescription);
  const semanticSimilarityScore = scoreSemanticSimilarity(
    resumeTokenSet,
    jobTokenSet
  );
  const experienceRelevanceScore = scoreExperienceRelevance(
    resumeText,
    jobDescription
  );
  const keywordDensityScore = scoreKeywordDensity(
    resumeTokens,
    jobTokens,
    matchedKeywords.length
  );
  const formattingScore = scoreFormattingHeuristic(input.resumeText);
  const educationScore = scoreEducation(resumeText, jobDescription);

  const breakdown = buildBreakdown({
    skillsMatchScore,
    semanticSimilarityScore,
    experienceRelevanceScore,
    keywordDensityScore,
    formattingScore,
    educationScore,
    matchedKeywords,
    missingKeywords,
  });

  const overallScore = Math.round(
    Object.values(breakdown).reduce(
      (total, item) => total + item.weightedScore,
      0
    )
  );

  return {
    overall_score: overallScore,
    explanation: getOverallExplanation(overallScore, breakdown),
    breakdown,
    summary: getSummary(overallScore),
    strengths: getStrengths(breakdown),
    improvements: getImprovements(breakdown, missingKeywords),
    matched_keywords: matchedKeywords,
    missing_keywords: missingKeywords,
  };
}

function buildBreakdown(scores: {
  skillsMatchScore: number;
  semanticSimilarityScore: number;
  experienceRelevanceScore: number;
  keywordDensityScore: number;
  formattingScore: number;
  educationScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
}): Record<WeightedCategory, ScoreBreakdownItem> {
  return {
    skills_match: createBreakdownItem(
      "Skills match",
      CATEGORY_WEIGHTS.skills_match,
      scores.skillsMatchScore,
      scores.matchedKeywords.length > 0
        ? `Matched ${scores.matchedKeywords.length} relevant skill keywords from the job description.`
        : "Very few core job skills were detected in the resume."
    ),
    semantic_similarity: createBreakdownItem(
      "Semantic similarity",
      CATEGORY_WEIGHTS.semantic_similarity,
      scores.semanticSimilarityScore,
      "Measures overlap between resume language and the target role language."
    ),
    experience_relevance: createBreakdownItem(
      "Experience relevance",
      CATEGORY_WEIGHTS.experience_relevance,
      scores.experienceRelevanceScore,
      "Evaluates whether the resume shows action-oriented work aligned with the role."
    ),
    keyword_density: createBreakdownItem(
      "Keyword density",
      CATEGORY_WEIGHTS.keyword_density,
      scores.keywordDensityScore,
      scores.missingKeywords.length > 0
        ? `Some target keywords are still missing, including ${scores.missingKeywords
            .slice(0, 3)
            .join(", ")}.`
        : "The resume includes a healthy spread of target-role keywords."
    ),
    formatting: createBreakdownItem(
      "Formatting",
      CATEGORY_WEIGHTS.formatting,
      scores.formattingScore,
      "Checks readability, section structure, bullet usage, and scan-friendly formatting."
    ),
    education: createBreakdownItem(
      "Education",
      CATEGORY_WEIGHTS.education,
      scores.educationScore,
      "Looks for education details and how well they align with the role requirements."
    ),
  };
}

function createBreakdownItem(
  label: string,
  weight: number,
  score: number,
  explanation: string
): ScoreBreakdownItem {
  return {
    label,
    weight: Math.round(weight * 100),
    score,
    weightedScore: Number((score * weight).toFixed(2)),
    explanation,
  };
}

function scoreSkillsMatch(resumeText: string, jobDescription: string) {
  const jobSkills = extractKnownTerms(jobDescription, SKILL_TERMS);

  if (jobSkills.length === 0) {
    return 55;
  }

  const matchedSkills = jobSkills.filter((term) => resumeText.includes(term));
  const ratio = matchedSkills.length / jobSkills.length;

  return clampScore(35 + ratio * 65);
}

function scoreSemanticSimilarity(
  resumeTokenSet: Set<string>,
  jobTokenSet: Set<string>
) {
  const union = new Set([...resumeTokenSet, ...jobTokenSet]);

  if (union.size === 0) {
    return 0;
  }

  const intersectionCount = [...jobTokenSet].filter((token) =>
    resumeTokenSet.has(token)
  ).length;

  return clampScore(20 + (intersectionCount / union.size) * 160);
}

function scoreExperienceRelevance(resumeText: string, jobDescription: string) {
  const resumeExperienceHits = countTermHits(resumeText, EXPERIENCE_TERMS);
  const jobExperienceHits = countTermHits(jobDescription, EXPERIENCE_TERMS);
  const numericEvidence = (resumeText.match(/\b\d+[%x+]?/g) ?? []).length;

  const base = 35 + resumeExperienceHits * 5 + numericEvidence * 3;
  const alignmentBoost = Math.min(jobExperienceHits * 2, 12);

  return clampScore(base + alignmentBoost);
}

function scoreKeywordDensity(
  resumeTokens: string[],
  jobTokens: string[],
  matchedKeywordsCount: number
) {
  const topJobKeywords = getTopKeywords(jobTokens, 18);

  if (topJobKeywords.length === 0 || resumeTokens.length === 0) {
    return 45;
  }

  const resumeKeywordHits = topJobKeywords.reduce((total, keyword) => {
    return total + resumeTokens.filter((token) => token === keyword).length;
  }, 0);

  const density = resumeKeywordHits / resumeTokens.length;
  const coverage = matchedKeywordsCount / topJobKeywords.length;

  return clampScore(20 + coverage * 50 + Math.min(density * 900, 30));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function scoreFormatting(rawResumeText: string) {
  const lines = rawResumeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const bulletLines = lines.filter((line) => /^[-*•]/.test(line)).length;
  const uppercaseHeadings = lines.filter(
    (line) => line.length < 35 && line === line.toUpperCase()
  ).length;
  const avgLineLength =
    lines.length === 0
      ? 0
      : lines.reduce((total, line) => total + line.length, 0) / lines.length;

  const bulletScore = Math.min((bulletLines / 6) * 30, 30);
  const headingScore = Math.min(uppercaseHeadings * 8, 24);
  const lineLengthScore =
    avgLineLength >= 35 && avgLineLength <= 115 ? 26 : 12;
  const sectionScore = hasCommonSections(rawResumeText) ? 20 : 8;

  return clampScore(bulletScore + headingScore + lineLengthScore + sectionScore);
}

function scoreFormattingHeuristic(rawResumeText: string) {
  const lines = rawResumeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const bulletLines = lines.filter((line) =>
    /^(?:[-*]|\u2022)/.test(line)
  ).length;
  const uppercaseHeadings = lines.filter(
    (line) => line.length < 35 && line === line.toUpperCase()
  ).length;
  const avgLineLength =
    lines.length === 0
      ? 0
      : lines.reduce((total, line) => total + line.length, 0) / lines.length;

  const bulletScore = Math.min((bulletLines / 6) * 30, 30);
  const headingScore = Math.min(uppercaseHeadings * 8, 24);
  const lineLengthScore =
    avgLineLength >= 35 && avgLineLength <= 115 ? 26 : 12;
  const sectionScore = hasCommonSections(rawResumeText) ? 20 : 8;

  return clampScore(bulletScore + headingScore + lineLengthScore + sectionScore);
}

function scoreEducation(resumeText: string, jobDescription: string) {
  const resumeEducationHits = countTermHits(resumeText, EDUCATION_TERMS);
  const jobEducationHits = countTermHits(jobDescription, EDUCATION_TERMS);

  if (resumeEducationHits === 0) {
    return jobEducationHits > 0 ? 25 : 50;
  }

  return clampScore(45 + resumeEducationHits * 10 + jobEducationHits * 3);
}

function getMatchedKeywords(
  resumeTokenSet: Set<string>,
  jobTokenSet: Set<string>
) {
  return [...jobTokenSet]
    .filter((token) => resumeTokenSet.has(token))
    .slice(0, 12);
}

function getMissingKeywords(
  resumeTokenSet: Set<string>,
  jobTokenSet: Set<string>
) {
  return [...jobTokenSet]
    .filter((token) => !resumeTokenSet.has(token))
    .slice(0, 12);
}

function getStrengths(breakdown: Record<WeightedCategory, ScoreBreakdownItem>) {
  return Object.values(breakdown)
    .filter((item) => item.score >= 75)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((item) => `${item.label} is strong: ${item.explanation}`);
}

function getImprovements(
  breakdown: Record<WeightedCategory, ScoreBreakdownItem>,
  missingKeywords: string[]
) {
  return Object.values(breakdown)
    .sort((left, right) => left.score - right.score)
    .slice(0, 3)
    .map((item) => {
      if (item.label === "Skills match" && missingKeywords.length > 0) {
        return `Add or emphasize missing target skills such as ${missingKeywords
          .slice(0, 4)
          .join(", ")}.`;
      }

      if (item.label === "Experience relevance") {
        return "Use more achievement-focused bullets with measurable outcomes tied to the target role.";
      }

      if (item.label === "Formatting") {
        return "Improve scan readability with clearer sections, bullet points, and consistent heading structure.";
      }

      if (item.label === "Education") {
        return "Make education and certifications easier to find if they are relevant to the role.";
      }

      return `Improve ${item.label.toLowerCase()} to better align with the job description.`;
    });
}

function getOverallExplanation(
  overallScore: number,
  breakdown: Record<WeightedCategory, ScoreBreakdownItem>
) {
  const strongest = Object.values(breakdown).sort(
    (left, right) => right.score - left.score
  )[0];
  const weakest = Object.values(breakdown).sort(
    (left, right) => left.score - right.score
  )[0];

  return `Overall ATS score is ${overallScore}%. Strongest area: ${strongest.label.toLowerCase()}. Weakest area: ${weakest.label.toLowerCase()}.`;
}

function getSummary(overallScore: number) {
  if (overallScore >= 80) {
    return "Strong ATS alignment with clear evidence of role fit.";
  }

  if (overallScore >= 65) {
    return "Moderate ATS alignment with a solid base and several areas to improve.";
  }

  return "Low ATS alignment. The resume needs stronger tailoring for this role.";
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function tokenize(value: string) {
  return (
    value
      .toLowerCase()
      .match(/[a-z0-9+#.]{2,}/g)
      ?.filter((token) => !COMMON_STOP_WORDS.has(token)) ?? []
  );
}

function getTopKeywords(tokens: string[], limit: number) {
  const frequencyMap = new Map<string, number>();

  for (const token of tokens) {
    frequencyMap.set(token, (frequencyMap.get(token) ?? 0) + 1);
  }

  return [...frequencyMap.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([token]) => token);
}

function extractKnownTerms(text: string, terms: string[]) {
  return terms.filter((term) => text.includes(term));
}

function countTermHits(text: string, terms: string[]) {
  return terms.filter((term) => text.includes(term)).length;
}

function hasCommonSections(text: string) {
  const normalized = text.toLowerCase();

  return ["experience", "education", "skills", "projects", "summary"].some(
    (section) => normalized.includes(section)
  );
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
