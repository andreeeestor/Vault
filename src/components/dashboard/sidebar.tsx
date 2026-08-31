"use client";

import { useRouter, usePathname } from "next/navigation";
import { FolderTree } from "@/components/vault/folder-tree";
import { StorageBar } from "./storage-bar";
import {
  ShieldCheck,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Star,
  Archive,
  KeyRound,
  FileClock,
  Folder as FolderIcon,
  HardDrive,
} from "lucide-react";
import type { StorageUsage } from "@/types";
import { useVaultStore } from "@/lib/vault-store";
import { cn, formatBytes, labelColorHex } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SHORTCUTS = [
  { href: "/vault/favorites", label: "Favoritos", icon: Star },
  { href: "/vault/passwords", label: "Senhas", icon: KeyRound },
  { href: "/vault/archived", label: "Arquivados", icon: Archive },
  { href: "/vault/trash", label: "Lixeira", icon: FileClock },
];

interface SidebarProps {
  user: { name: string; email: string; image: string | null };
  storage: StorageUsage;
}

export function Sidebar({ user, storage }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isSidebarOpen = useVaultStore((s) => s.isSidebarOpen);
  const setSidebarOpen = useVaultStore((s) => s.setSidebarOpen);
  const isSidebarCollapsed = useVaultStore((s) => s.isSidebarCollapsed);
  const setSidebarCollapsed = useVaultStore((s) => s.setSidebarCollapsed);
  const folders = useVaultStore((s) => s.folders);
  const currentFolderId = useVaultStore((s) => s.currentFolderId);
  const setCurrentFolder = useVaultStore((s) => s.setCurrentFolder);

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleFolderClick = (id: string, isRoot: boolean) => {
    setCurrentFolder(id);
    router.push(isRoot ? "/vault" : `/vault/folder/${id}`);
  };

  const usedPct = Math.min(100, Math.round((storage.used / storage.limit) * 100));

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
          "fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col border-r border-[var(--border)] bg-[var(--background-elevated)] transition-all duration-300 md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          isSidebarCollapsed ? "w-[56px]" : "w-[260px]"
        )}
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-[var(--border)] px-3",
            isSidebarCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-white"
                style={{ background: "var(--gradient-brand)" }}
              >
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-heading text-base font-semibold text-[var(--foreground)]">
                Vault
              </span>
            </div>
          )}

          <div className="flex items-center gap-1">
            {/* Desktop collapse / expand button */}
            <button
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] md:flex"
              title={isSidebarCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-4.5 w-4.5" />
              ) : (
                <PanelLeftClose className="h-4.5 w-4.5" />
              )}
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] hover:bg-[var(--surface-hover)] md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Expanded View ─────────────────────────────────────────── */}
        {!isSidebarCollapsed ? (
          <>
            {/* User info */}
            <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ background: "var(--gradient-brand)" }}
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--foreground)]">
                  {user.name}
                </p>
                <p className="truncate text-xs text-[var(--foreground-subtle)]">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Folder tree */}
            <div className="flex-1 overflow-y-auto py-3">
              <FolderTree />
            </div>

            {/* Storage bar */}
            <div className="p-3">
              <StorageBar
                used={storage.used}
                limit={storage.limit}
                plan={storage.plan}
              />
            </div>
          </>
        ) : (
          /* ── Collapsed View (Icons + Tooltips) ────────────────────── */
          <div className="flex flex-1 flex-col items-center justify-between overflow-y-auto py-3 scrollbar-none">
            {/* Top items: user + shortcuts + folders */}
            <div className="flex w-full flex-col items-center gap-1 px-1.5">
              {/* User avatar */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white transition-transform hover:scale-105"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex flex-col gap-0.5">
                  <span className="font-semibold">{user.name}</span>
                  <span className="text-[11px] opacity-80">{user.email}</span>
                </TooltipContent>
              </Tooltip>

              <div className="my-1.5 h-px w-6 bg-[var(--border)]" />

              {/* Shortcuts */}
              {SHORTCUTS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Tooltip key={href}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => router.push(href)}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]",
                          isActive && "bg-[var(--primary)]/10 text-[var(--primary)] font-semibold"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}

              <div className="my-1.5 h-px w-6 bg-[var(--border)]" />

              {/* Folders */}
              <div className="flex w-full flex-col items-center gap-1">
                {folders.map((folder) => {
                  const isActive = currentFolderId === folder.id;
                  return (
                    <Tooltip key={folder.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleFolderClick(folder.id, folder.isRoot)}
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] transition-colors hover:bg-[var(--surface-hover)]",
                            isActive && "bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/30"
                          )}
                        >
                          <FolderIcon
                            className="h-4 w-4"
                            style={{ color: labelColorHex(folder.color) }}
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="flex flex-col gap-0.5">
                        <span className="font-medium">{folder.name}</span>
                        <span className="text-[10px] opacity-75">
                          {folder.itemCount} {folder.itemCount === 1 ? "item" : "itens"}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* Bottom storage icon with tooltip */}
            <div className="mt-auto pt-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex h-9 w-9 cursor-default items-center justify-center rounded-[var(--radius-md)] text-[var(--foreground-subtle)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] transition-colors">
                    <HardDrive className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex flex-col gap-0.5">
                  <span className="font-semibold">Armazenamento ({storage.plan.toUpperCase()})</span>
                  <span className="text-[11px] opacity-85">
                    {formatBytes(storage.used)} de {formatBytes(storage.limit)} ({usedPct}%)
                  </span>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
