"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

const formContent = {
  login: {
    title: "Sign in",
    submitLabel: "Sign in",
    endpoint: "/api/auth/login",
    footerText: "Need an account?",
    footerHref: "/signup",
    footerLabel: "Create an account",
  },
  signup: {
    title: "Sign up",
    submitLabel: "Create account",
    endpoint: "/api/auth/signup",
    footerText: "Already have an account?",
    footerHref: "/login",
    footerLabel: "Sign in",
  },
} as const;

const passwordRequirements = [
  {
    label: "At least 8 characters",
    test: (value: string) => value.length >= 8,
  },
  {
    label: "One uppercase letter",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: "One lowercase letter",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    label: "One number",
    test: (value: string) => /[0-9]/.test(value),
  },
] as const;

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const content = formContent[mode];

  async function handleSubmit(formData: FormData) {
    const payload =
      mode === "signup"
        ? {
            name: String(formData.get("name") ?? ""),
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
          }
        : {
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
          };

    try {
      const response = await fetch(content.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        toast.error("Authentication error", {
          description: data.error ?? "Please check your details and try again.",
        });
        return;
      }

      toast.success(data.message ?? "You are signed in.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Connection problem", {
        description: "We could not reach the server. Please try again.",
      });
    }
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="p-6 pb-0">
        <CardTitle className="text-2xl">{content.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 p-6">
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();

            const formData = new FormData(event.currentTarget);

            setIsLoading(true);

            try {
              await handleSubmit(formData);
            } finally {
              setIsLoading(false);
            }
          }}
        >
          {mode === "signup" ? (
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ava Johnson"
                autoComplete="name"
                disabled={isPending}
              />
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="pr-12"
                placeholder="Enter your password"
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isPending}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground transition hover:text-foreground disabled:pointer-events-none"
                onClick={() => setShowPassword((value) => !value)}
                disabled={isPending}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {mode === "signup" ? (
              <div className="grid gap-2 pt-1">
                {passwordRequirements.map((requirement) => {
                  const isComplete = requirement.test(password);

                  return (
                    <div
                      key={requirement.label}
                      className={cn(
                        "flex items-center gap-2 text-xs transition-colors",
                        isComplete
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-4 items-center justify-center rounded-full border transition-colors",
                          isComplete
                            ? "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "border-border bg-background",
                        )}
                      >
                        {isComplete ? <Check className="size-3" /> : null}
                      </span>
                      {requirement.label}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          <Button className="h-11 w-full rounded-xl" disabled={isLoading}>
            {isLoading ? "Please wait..." : content.submitLabel}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {content.footerText}{" "}
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            href={content.footerHref}
          >
            {content.footerLabel}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
