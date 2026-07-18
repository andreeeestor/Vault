import { FolderTree } from "@/components/vault/folder-tree";
import { StorageBar } from "./storage-bar";
import { MOCK_STORAGE, MOCK_USER } from "@/lib/mock-data";
import { ShieldCheck } from "lucide-react";

export function Sidebar() {
  const initials = MOCK_USER.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--background-elevated)]">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-white"
          style={{ background: "var(--gradient-brand)" }}
        >
          <ShieldCheck className="h-4.5 w-4.5" />
        </div>
        <span className="text-heading text-base font-semibold text-[var(--foreground)]">Vault</span>
      </div>

      <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 pb-4">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ background: "var(--gradient-brand)" }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--foreground)]">{MOCK_USER.name}</p>
          <p className="truncate text-xs text-[var(--foreground-subtle)]">{MOCK_USER.email}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        <FolderTree />
      </div>

      <div className="p-3">
        <StorageBar used={MOCK_STORAGE.used} limit={MOCK_STORAGE.limit} plan={MOCK_STORAGE.plan} />
      </div>
    </aside>
  );
}
