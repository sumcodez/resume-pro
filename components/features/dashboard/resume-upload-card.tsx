"use client";

import { useRef, useState } from "react";
import { LoaderCircle, UploadCloud } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ResumeUploadCardProps = {
  onExtracted: (text: string) => void;
  onUploadStateChange?: (state: "idle" | "uploading" | "done" | "error") => void;
};

type UploadResponse = {
  error: boolean;
  message: string;
  extractedText?: string;
  fileName?: string;
};

export function ResumeUploadCard({
  onExtracted,
  onUploadStateChange,
}: ResumeUploadCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(file: File) {
    setIsUploading(true);
    onUploadStateChange?.("uploading");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as UploadResponse;

      if (!response.ok || data.error || !data.extractedText) {
        toast.error("Upload could not be completed", {
          description:
            data.message ?? "We could not extract readable text from this file.",
        });
        onUploadStateChange?.("error");
        return;
      }

      onExtracted(data.extractedText);
      onUploadStateChange?.("done");
      toast.success("Resume text is ready", {
        description: `We extracted the text from ${data.fileName ?? file.name}.`,
      });
    } catch {
      toast.error("Upload could not be completed", {
        description: "Please try again in a moment.",
      });
      onUploadStateChange?.("error");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card className="overflow-hidden border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_28%),rgba(255,255,255,0.98)]">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>Upload a resume</CardTitle>
            <CardDescription>
              Add a PDF or DOCX file and we will extract the resume text for
              analysis.
            </CardDescription>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2 text-center">
              PDF
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2 text-center">
              DOCX
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2 text-center">
              5 MB
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <button
          type="button"
          className={cn(
            "flex min-h-52 w-full flex-col items-center justify-center gap-4 rounded-[1.75rem] border border-dashed px-6 py-8 text-center transition",
            isDragging
              ? "border-primary bg-primary/8"
              : "border-border/80 bg-background/70 hover:bg-muted/30"
          )}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);

            const file = event.dataTransfer.files[0];

            if (file) {
              void handleFile(file);
            }
          }}
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <LoaderCircle className="size-9 animate-spin text-primary" />
          ) : (
            <div className="rounded-full border border-primary/20 bg-primary/10 p-4">
              <UploadCloud className="size-8 text-primary" />
            </div>
          )}
          <div className="space-y-2">
            <p className="text-lg font-semibold">
              {isUploading
                ? "Extracting resume text..."
                : "Drop your resume here or browse files"}
            </p>
            <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">
              Your extracted text will appear in the analyzer automatically once
              the file is processed.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              Secure upload
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              Text extraction
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              Ready for review
            </span>
          </div>
        </button>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              void handleFile(file);
            }

            event.currentTarget.value = "";
          }}
        />
      </CardContent>
    </Card>
  );
}
