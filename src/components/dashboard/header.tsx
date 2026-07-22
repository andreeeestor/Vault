"use client";

import { Search, Sun, Moon, Menu } from "lucide-react";
import { ViewToggle } from "@/components/vault/view-toggle";
import { NewItemDropdown } from "./new-item-dropdown";
import { UserDropdown } from "./user-dropdown";
import { useTheme } from "@/components/providers/theme-provider";
import { MOCK_USER } from "@/lib/mock-data";
import { useVaultStore } from "@/lib/vault-store";
import type { ReactNode } from "react";

export function DashboardHeader({ breadcrumb }: { breadcrumb: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const storeUser = useVaultStore((s) => s.user);
  const setSidebarOpen = useVaultStore((s) => s.setSidebarOpen);

  const user = storeUser || {
    name: MOCK_USER.name,
    email: MOCK_USER.email,
    image: MOCK_USER.image,
  };

  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[var(--border)] px-4 md:px-6">
      <button
        onClick={() => setSidebarOpen(true)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-hover)] md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1 overflow-hidden">{breadcrumb}</div>

      <button
        aria-label="Abrir busca"
        onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-hover)] sm:hidden"
      >
        <Search className="h-4 w-4" />
      </button>

      <button
        onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
        className="hidden items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--foreground-subtle)] transition-colors hover:bg-[var(--surface-hover)] sm:flex"
      >
        <Search className="h-3.5 w-3.5" />
        Buscar
        <kbd className="ml-3 rounded border border-[var(--border-strong)] px-1.5 py-0.5 text-[10px]">
          ⌘K
        </kbd>
      </button>

      <div className="flex items-center gap-2">
        <ViewToggle />

        <button
          aria-label="Alternar tema"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-hover)]"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <NewItemDropdown />
        <UserDropdown name={user.name} email={user.email} image={user.image} />
      </div>
    </header>
  );
}
