"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

type ConfirmationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isPending?: boolean;
  variant?: "default" | "destructive";
  children?: ReactNode;
};

export function ConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isPending = false,
  variant = "default",
  children,
}: ConfirmationModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        onOpenChange(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPending, onOpenChange, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm"
      onClick={() => {
        if (!isPending) {
          onOpenChange(false);
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        className="w-full max-w-md rounded-[2rem] border border-border/70 bg-background p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2
              id="confirmation-modal-title"
              className="text-xl font-semibold tracking-tight"
            >
              {title}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-2xl cursor-pointer"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            aria-label="Close confirmation modal"
          >
            <X className="size-4" />
          </Button>
        </div>

        {children ? <div className="mt-4">{children}</div> : null}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl cursor-pointer"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            className="rounded-2xl cursor-pointer"
            onClick={() => {
              void onConfirm();
            }}
            disabled={isPending}
          >
            {isPending ? "Please wait..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
