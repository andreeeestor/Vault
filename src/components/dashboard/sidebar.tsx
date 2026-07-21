"use client";

import { FolderTree } from "@/components/vault/folder-tree";
import { StorageBar } from "./storage-bar";
import { ShieldCheck, X } from "lucide-react";
import type { StorageUsage } from "@/types";
import { useVaultStore } from "@/lib/vault-store";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: { name: string; email: string; image: string | null };
  storage: StorageUsage;
}

export function Sidebar({ user, storage }: SidebarProps) {
  const isSidebarOpen = useVaultStore((s) => s.isSidebarOpen);
  const setSidebarOpen = useVaultStore((s) => s.setSidebarOpen);

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {isSidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-[260px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--background-elevated)] transition-transform duration-300 md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <span className="text-heading text-base font-semibold text-[var(--foreground)]">Vault</span>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] hover:bg-[var(--surface-hover)] md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 pb-4">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ background: "var(--gradient-brand)" }}
          >
            {user.image ? (
              
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
    </>
  );
}
