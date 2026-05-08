"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LogoutButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        toast.error("Sign out failed", {
          description: data.error ?? "Please try again.",
        });
        setIsPending(false);
        return;
      }

      setIsOpen(false);
      toast.success("You have been signed out.");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Sign out failed", {
        description: "Please try again in a moment.",
      });
      setIsPending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <ConfirmationModal
        open={isOpen}
        onOpenChange={setIsOpen}
        onConfirm={async () => {
          await handleLogout();
        }}
        title="Sign out?"
        description="You will be signed out of Resume Score on this device."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        isPending={isPending}
        variant="destructive"
      />

      <Button
        variant="outline"
        size="sm"
        className="rounded-2xl cursor-pointer"
        disabled={isPending}
        onClick={() => setIsOpen(true)}
      >
        <LogOut className="size-4" />
        Sign out
      </Button>
    </div>
  );
}
