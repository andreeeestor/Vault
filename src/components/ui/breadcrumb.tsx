import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Breadcrumb({ children }: { children: ReactNode }) {
  return (
    <nav aria-label="Navegação de pastas" className="flex min-w-0 items-center gap-1 text-sm">
      {children}
    </nav>
  );
}

export function BreadcrumbSeparator() {
  return <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--foreground-subtle)]" />;
}

export function BreadcrumbItem({
  children,
  active,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "truncate rounded-md px-1.5 py-0.5",
        active
          ? "font-semibold text-[var(--foreground)]"
          : "text-[var(--foreground-muted)]",
        className
      )}
    >
      {children}
    </span>
  );
}
