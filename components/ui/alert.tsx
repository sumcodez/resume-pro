import * as React from "react";

import { cn } from "@/lib/utils";

function Alert({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "destructive";
}) {
  return (
    <div
      role="alert"
      data-slot="alert"
      data-variant={variant}
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        variant === "destructive"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-border bg-muted/50 text-foreground",
        className
      )}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"h5">) {
  return <h5 className={cn("font-medium", className)} {...props} />;
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("mt-1 leading-6", className)} {...props} />;
}

export { Alert, AlertDescription, AlertTitle };
