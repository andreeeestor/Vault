"use client";

import { LayoutGrid, List } from "lucide-react";
import { useVaultStore } from "@/lib/vault-store";
import { cn } from "@/lib/utils";

export function ViewToggle() {
  const viewMode = useVaultStore((s) => s.viewMode);
  const setViewMode = useVaultStore((s) => s.setViewMode);

  return (
    <div className="flex items-center rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] p-0.5">
      {(
        [
          { mode: "grid" as const, icon: LayoutGrid, label: "Grade" },
          { mode: "list" as const, icon: List, label: "Lista" },
        ] as const
      ).map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          aria-label={label}
          aria-pressed={viewMode === mode}
          onClick={() => setViewMode(mode)}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-[7px] transition-colors",
            viewMode === mode
              ? "bg-[var(--primary)] text-white shadow-sm"
              : "text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
