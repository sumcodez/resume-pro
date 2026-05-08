import { NextResponse } from "next/server";

import { getErrorMessage } from "@/lib/auth/http";
import { getSessionUser } from "@/lib/auth/session";
import { extractTextFromResumeFile } from "@/lib/files/extract-text";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json(
        { error: true, message: "Please sign in to upload a resume." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: true, message: "Please choose a PDF or DOCX resume file." },
        { status: 400 }
      );
    }

    const extractedText = await extractTextFromResumeFile(file);

    if (!extractedText) {
      return NextResponse.json(
        {
          error: true,
          message: "We could not find readable text in that file.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      error: false,
      message: "Resume text is ready.",
      fileName: file.name,
      extractedText,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: true,
        message: getErrorMessage(error),
      },
      { status: 400 }
    );
  }
}
