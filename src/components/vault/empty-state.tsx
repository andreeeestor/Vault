import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center",
        className
      )}
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-lg)]"
        style={{ background: "var(--gradient-brand-soft)" }}
      >
        <Icon className="h-7 w-7 text-[var(--primary)]" strokeWidth={1.5} />
      </div>
      <div className="max-w-sm">
        <h3 className="text-heading text-base font-semibold text-[var(--foreground)]">{title}</h3>
        <p className="text-body mt-1.5 text-sm text-[var(--foreground-muted)]">{description}</p>
      </div>
      {action}
    </div>
  );
}
