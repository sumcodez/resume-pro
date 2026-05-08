import { cn } from "@/lib/utils";

type ProgressProps = {
  value: number;
  className?: string;
  indicatorClassName?: string;
};

export function Progress({
  value,
  className,
  indicatorClassName,
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      data-slot="progress"
      className={cn(
        "h-2.5 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
    >
      <div
        data-slot="progress-indicator"
        className={cn(
          "h-full rounded-full bg-primary transition-all duration-500",
          indicatorClassName
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
