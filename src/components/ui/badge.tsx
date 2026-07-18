import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-hover)] px-2.5 py-0.5 text-xs font-medium text-[var(--foreground-muted)]",
        className
      )}
      {...props}
    />
  );
}

export function Dot({ hex, className }: { hex: string; className?: string }) {
  return (
    <span
      className={cn("inline-block h-2 w-2 shrink-0 rounded-full", className)}
      style={{ backgroundColor: hex }}
    />
  );
}
