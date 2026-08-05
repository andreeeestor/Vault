"use client";

import { useEffect } from "react";
import { PenLine } from "lucide-react";
import { useVaultStore, getChildFolders, getItemsInFolder } from "@/lib/vault-store";
import { DashboardHeader } from "@/components/dashboard/header";
import { BreadcrumbNav } from "./breadcrumb-nav";
import { ItemGrid } from "./item-grid";
import { ItemList } from "./item-list";
import { SelectionToolbar } from "./selection-toolbar";
import { TabBar } from "./tab-bar";
import { ItemViewer } from "./item-viewer";
import { ItemDetailSidebar } from "./item-detail-sidebar";
import type { Folder, SortField, VaultItem } from "@/types";

// ─── sort helpers ──────────────────────────────────────────────────────────────
function sortFolders(folders: Folder[], field: SortField, dir: "asc" | "desc"): Folder[] {
  const sorted = [...folders].sort((a, b) => {
    if (field === "name") return a.name.localeCompare(b.name);
    if (field === "updatedAt") return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    return 0;
  });
  return dir === "asc" ? sorted : sorted.reverse();
}

function sortItems(items: VaultItem[], field: SortField, dir: "asc" | "desc"): VaultItem[] {
  const sorted = [...items].sort((a, b) => {
    if (field === "name") return a.title.localeCompare(b.title);
    if (field === "updatedAt") return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    if (field === "type") return a.type.localeCompare(b.type);
    if (field === "fileSize") return (a.fileSize ?? 0) - (b.fileSize ?? 0);
    return 0;
  });
  return dir === "asc" ? sorted : sorted.reverse();
}

// ─── Main workspace ────────────────────────────────────────────────────────────
export function VaultWorkspace({ folderId }: { folderId: string }) {
  const folders = useVaultStore((s) => s.folders);
  const items = useVaultStore((s) => s.items);
  const viewMode = useVaultStore((s) => s.viewMode);
  const sortField = useVaultStore((s) => s.sortField);
  const sortDirection = useVaultStore((s) => s.sortDirection);
  const setCurrentFolder = useVaultStore((s) => s.setCurrentFolder);
  const selectAll = useVaultStore((s) => s.selectAll);
  const clearSelection = useVaultStore((s) => s.clearSelection);

  // Tab state
  const openTabs = useVaultStore((s) => s.openTabs);
  const activeTabId = useVaultStore((s) => s.activeTabId);
  const closeTab = useVaultStore((s) => s.closeTab);

  useEffect(() => {
    setCurrentFolder(folderId);
  }, [folderId, setCurrentFolder]);

  const childFolders = sortFolders(getChildFolders(folders, folderId), sortField, sortDirection);
  const folderItems = sortItems(getItemsInFolder(items, folderId), sortField, sortDirection);

  // Remove tabs for deleted items
  useEffect(() => {
    const itemIds = new Set(items.map((i) => i.id));
    openTabs.forEach((tab) => {
      if (!itemIds.has(tab.id)) closeTab(tab.id);
    });
  }, [items, openTabs, closeTab]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        selectAll([...childFolders.map((f) => f.id), ...folderItems.map((i) => i.id)]);
      }
      if (e.key === "Escape") clearSelection();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [childFolders, folderItems, selectAll, clearSelection]);

  // Resolve active item from store (always fresh)
  const activeItem = activeTabId ? items.find((i) => i.id === activeTabId) ?? null : null;

  const hasTabs = openTabs.length > 0;

  return (
    <div className="flex min-h-screen flex-1 flex-col overflow-hidden lg:h-screen lg:flex-row">
      {/* ── Left: file browser ─────────────────────────────────────────── */}
      <div
        className={
          hasTabs
            ? "hidden w-[280px] shrink-0 flex-col border-r border-[var(--border)] lg:flex"
            : "flex flex-1 flex-col"
        }
      >
        <DashboardHeader breadcrumb={<BreadcrumbNav />} />
        <main
          className="flex-1 overflow-y-auto p-4 sm:p-5"
          onClick={(e) => e.currentTarget === e.target && clearSelection()}
        >
          {viewMode === "grid" ? (
            <ItemGrid folders={childFolders} items={folderItems} />
          ) : (
            <ItemList folders={childFolders} items={folderItems} />
          )}
        </main>
        <SelectionToolbar />
      </div>

      {/* ── Right: tab area ─────────────────────────────────────────────── */}
      {hasTabs && (
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Tab bar */}
          <TabBar />

          {/* Content */}
          {activeItem ? (
            <div className="flex min-h-0 flex-1 overflow-hidden">
              {/* Viewer */}
              <div className="relative min-w-0 flex-1 overflow-hidden">
                <ItemViewer item={activeItem} />
              </div>
              {/* Details sidebar */}
              <ItemDetailSidebar item={activeItem} />
            </div>
          ) : (
            /* All tabs closed or active item not found */
            <NoTabSelected />
          )}
        </div>
      )}
    </div>
  );
}

function NoTabSelected() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "var(--gradient-brand-soft)" }}
      >
        <PenLine className="h-7 w-7 text-[var(--primary)]" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--foreground)]">Nenhum item aberto</p>
        <p className="mt-1 text-xs text-[var(--foreground-muted)]">
          Clique em um item no painel esquerdo para abri-lo aqui
        </p>
      </div>
    </div>
  );
}
