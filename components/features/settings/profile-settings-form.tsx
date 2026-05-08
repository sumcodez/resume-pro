"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Mail, Save, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type ProfileSettingsFormProps = {
  user: {
    name: string;
    email: string;
  };
};

export function ProfileSettingsForm({ user }: ProfileSettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const hasChanges = name.trim() !== user.name || email.trim() !== user.email;

  async function handleSubmit() {
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      const data = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        toast.error("Profile update failed", {
          description: data.error ?? "Please check your details and try again.",
        });
        return;
      }

      toast.success(data.message ?? "Profile settings updated.");
      router.refresh();
    } catch {
      toast.error("Connection problem", {
        description: "We could not reach the server. Please try again.",
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <span className="text-sm font-medium text-muted-foreground">
          Account
        </span>
        <CardTitle>Profile settings</CardTitle>
        <CardDescription>
          Update the name and email address attached to your Resume Score
          account.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(() => {
              void handleSubmit();
            });
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="profile-name">Full name</Label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="profile-name"
                name="name"
                className="pl-11"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="profile-email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="profile-email"
                name="email"
                type="email"
                className="pl-11"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border/70 bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground">
              Password recovery
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Forgot password and email verification controls will live here
              when that flow is ready.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              className="h-11 rounded-2xl"
              disabled={isPending || !hasChanges}
            >
              <Save className="size-4" />
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
