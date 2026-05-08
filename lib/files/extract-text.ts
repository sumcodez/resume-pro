import { createRequire } from "node:module";
import mammoth from "mammoth";

const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const require = createRequire(import.meta.url);
let pdfParseModulePromise: Promise<PDFParseModule> | null = null;
let pdfEnvironmentReady = false;

type PDFParseInstance = {
  getText: () => Promise<{ text: string }>;
  destroy: () => Promise<void>;
};

type PDFParseConstructor = new (options: { data: Buffer }) => PDFParseInstance;
type PDFParseModule = { PDFParse: PDFParseConstructor };
type CanvasModule = {
  DOMMatrix: typeof globalThis.DOMMatrix;
  DOMPoint: typeof globalThis.DOMPoint;
  DOMRect: typeof globalThis.DOMRect;
  ImageData: typeof globalThis.ImageData;
  Path2D: typeof globalThis.Path2D;
};

export function isAcceptedResumeFile(file: File) {
  const lowerName = file.name.toLowerCase();
  const hasAcceptedExtension = ACCEPTED_EXTENSIONS.some((extension) =>
    lowerName.endsWith(extension)
  );

  return ACCEPTED_TYPES.has(file.type) || hasAcceptedExtension;
}

export function validateResumeFile(file: File) {
  if (!isAcceptedResumeFile(file)) {
    throw new Error("Only PDF and DOCX files are supported.");
  }

  if (file.size === 0) {
    throw new Error("The uploaded file is empty.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("File is too large. Please upload a file under 5 MB.");
  }
}

export async function extractTextFromResumeFile(file: File) {
  validateResumeFile(file);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const lowerName = file.name.toLowerCase();

  if (file.type === "application/pdf" || lowerName.endsWith(".pdf")) {
    const { PDFParse } = await loadPdfParse();
    const parser = new PDFParse({ data: buffer });

    try {
      const parsed = await parser.getText();
      return normalizeExtractedText(parsed.text);
    } finally {
      await parser.destroy();
    }
  }

  const parsed = await mammoth.extractRawText({ buffer });
  return normalizeExtractedText(parsed.value);
}

function normalizeExtractedText(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function loadPdfParse() {
  ensurePdfNodeEnvironment();

  pdfParseModulePromise ??= Promise.resolve(
    require("pdf-parse") as PDFParseModule
  );

  return pdfParseModulePromise;
}

function ensurePdfNodeEnvironment() {
  if (pdfEnvironmentReady) {
    return;
  }

  const { DOMMatrix, DOMPoint, DOMRect, ImageData, Path2D } = require(
    "@napi-rs/canvas"
  ) as CanvasModule;

  globalThis.DOMMatrix ??= DOMMatrix;
  globalThis.DOMPoint ??= DOMPoint;
  globalThis.DOMRect ??= DOMRect;
  globalThis.ImageData ??= ImageData;
  globalThis.Path2D ??= Path2D;

  pdfEnvironmentReady = true;
}
