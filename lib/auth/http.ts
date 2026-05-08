import { ZodError } from "zod";

export function getErrorMessage(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Invalid request data.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function getErrorStatus(error: unknown) {
  if (error instanceof ZodError) {
    return 400;
  }

  return 500;
}
