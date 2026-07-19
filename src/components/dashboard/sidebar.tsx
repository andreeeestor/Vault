import { FolderTree } from "@/components/vault/folder-tree";
import { StorageBar } from "./storage-bar";
import { ShieldCheck } from "lucide-react";
import type { StorageUsage } from "@/types";

interface SidebarProps {
  user: { name: string; email: string; image: string | null };
  storage: StorageUsage;
}

export function Sidebar({ user, storage }: SidebarProps) {
  const initials = user.name
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
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--foreground)]">{user.name}</p>
          <p className="truncate text-xs text-[var(--foreground-subtle)]">{user.email}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        <FolderTree />
      </div>

      <div className="p-3">
        <StorageBar used={storage.used} limit={storage.limit} plan={storage.plan} />
      </div>
    </aside>
  );
}
