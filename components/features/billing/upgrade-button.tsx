"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type UpgradeButtonProps = {
  currentPlan: "free" | "pro";
  variant?: "default" | "outline";
  fullWidth?: boolean;
};

export function UpgradeButton({
  currentPlan,
  variant = "default",
  fullWidth = false,
}: UpgradeButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  if (currentPlan === "pro") {
    return (
      <Button variant="outline" className={fullWidth ? "w-full rounded-2xl" : "rounded-2xl"} disabled>
        Current plan
      </Button>
    );
  }

  async function handleUpgrade() {
    setIsPending(true);

    try {
      const response = await fetch("/api/billing/upgrade", {
        method: "POST",
      });
      const data = (await response.json()) as { error?: boolean; message?: string };

      if (!response.ok || data.error) {
        toast.error("Upgrade could not be completed", {
          description: data.message ?? "Please try again in a moment.",
        });
        setIsPending(false);
        return;
      }

      setOpen(false);
      toast.success(data.message ?? "Your Pro plan is active.");
      router.refresh();
      router.push("/pricing");
    } catch {
      toast.error("Upgrade could not be completed", {
        description: "Please try again in a moment.",
      });
      setIsPending(false);
    }
  }

  return (
    <>
      <ConfirmationModal
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleUpgrade}
        title="Upgrade to Pro"
        description="Activate Pro instantly, refresh your scan access, and unlock 4 resume scans per month."
        confirmLabel="Upgrade to Pro"
        cancelLabel="Not now"
        isPending={isPending}
      />

      <Button
        variant={variant}
        className={fullWidth ? "w-full rounded-2xl" : "rounded-2xl"}
        onClick={() => setOpen(true)}
      >
        Upgrade to Pro
      </Button>
    </>
  );
}
