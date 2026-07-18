import { formatBytes } from "@/lib/utils";
import { HardDrive } from "lucide-react";

export function StorageBar({
  used,
  limit,
  plan,
}: {
  used: number;
  limit: number;
  plan: "free" | "pro" | "business";
}) {
  const pct = Math.min(100, (used / limit) * 100);
  const isNearLimit = pct > 85;

  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--foreground-muted)]">
        <HardDrive className="h-3.5 w-3.5" />
        Armazenamento
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: isNearLimit ? "var(--danger)" : "var(--gradient-brand)",
          }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-[var(--foreground-subtle)]">
        <span>
          {formatBytes(used)} de {formatBytes(limit)}
        </span>
        {plan === "free" && (
          <a href="/settings/billing" className="font-medium text-[var(--primary)] hover:underline">
            Fazer upgrade
          </a>
        )}
      </div>
    </div>
  );
}
