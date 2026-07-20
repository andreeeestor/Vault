import { Loader2 } from "lucide-react";

export default function GlobalVaultLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
        <span className="text-xs text-[var(--foreground-subtle)] font-medium">Carregando…</span>
      </div>
    </div>
  );
}
