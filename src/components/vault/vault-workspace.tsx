"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutPanelLeft, Folder as FolderIcon } from "lucide-react";
import { useVaultStore, getChildFolders, getItemsInFolder } from "@/lib/vault-store";
import { ITEM_TYPE_META } from "@/lib/item-meta";
import { DashboardHeader } from "@/components/dashboard/header";
import { BreadcrumbNav } from "./breadcrumb-nav";
import { ItemGrid } from "./item-grid";
import { ItemList } from "./item-list";
import { SelectionToolbar } from "./selection-toolbar";
import { TabBar } from "./tab-bar";
import { ItemViewer } from "./item-viewer";
import { ItemDetailSidebar } from "./item-detail-sidebar";
import { labelColorHex, formatRelativeDate } from "@/lib/utils";
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

  // Auto-close tabs for deleted items
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

  const activeItem = activeTabId ? items.find((i) => i.id === activeTabId) ?? null : null;
  const hasTabs = openTabs.length > 0;

  return (
    /*
      VaultWorkspace fills the flex-1 column in DashboardLayout.
      Structure:
        [Full-width header]
        [Content row: file browser (left) | tab content (right)]
    */
    <div className="flex h-screen flex-col overflow-hidden">
      {/* ── Full-width sticky header ──────────────────────────────────── */}
      <DashboardHeader breadcrumb={<BreadcrumbNav />} />

      {/* ── Scrollable content row ────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* ── Left: file browser ───────────────────────────────────────
            • No tabs open → fills full width (flex-1)
            • Tabs open → 260px fixed, hidden on small screens
        ─────────────────────────────────────────────────────────── */}
        <aside
          className={
            hasTabs
              ? "hidden w-[260px] shrink-0 flex-col overflow-y-auto border-r border-[var(--border)] lg:flex"
              : "flex flex-1 flex-col overflow-y-auto"
          }
          onClick={(e) => e.currentTarget === e.target && clearSelection()}
        >
          <div className="p-3 sm:p-4">
            {hasTabs ? (
              /* Compact list for narrow 260px panel */
              <FileBrowserList
                folders={childFolders}
                items={folderItems}
                activeTabId={activeTabId}
              />
            ) : viewMode === "grid" ? (
              <ItemGrid folders={childFolders} items={folderItems} />
            ) : (
              <ItemList folders={childFolders} items={folderItems} />
            )}
          </div>
        </aside>

        {/* ── Right: tab content area ───────────────────────────────────
            Only visible when at least one tab is open
        ─────────────────────────────────────────────────────────── */}
        {hasTabs && (
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            {/* Tab strip */}
            <TabBar />

            {/* Active item viewer + detail sidebar */}
            {activeItem ? (
              <div className="flex min-h-0 flex-1 overflow-hidden">
                {/* Main content */}
                <div className="relative min-w-0 flex-1 overflow-hidden">
                  <ItemViewer item={activeItem} />
                </div>
                {/* Details sidebar (hidden on small screens) */}
                <div className="hidden lg:block">
                  <ItemDetailSidebar item={activeItem} />
                </div>
              </div>
            ) : (
              <NoItemSelected />
            )}
          </div>
        )}
      </div>

      <SelectionToolbar />
    </div>
  );
}

// ─── Compact file browser for the 260px narrow panel ─────────────────────────
function FileBrowserList({
  folders,
  items,
  activeTabId,
}: {
  folders: Folder[];
  items: VaultItem[];
  activeTabId: string | null;
}) {
  const router = useRouter();
  const setCurrentFolder = useVaultStore((s) => s.setCurrentFolder);
  const openTab = useVaultStore((s) => s.openTab);

  if (folders.length === 0 && items.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-[var(--foreground-subtle)]">
        Pasta vazia
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {/* Folders */}
      {folders.map((folder) => (
        <button
          key={folder.id}
          onClick={() => {
            setCurrentFolder(folder.id);
            router.push(`/vault/folder/${folder.id}`);
          }}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-[var(--surface-hover)]"
        >
          <FolderIcon
            className="h-3.5 w-3.5 shrink-0"
            style={{ color: labelColorHex(folder.color) }}
          />
          <span className="truncate font-medium text-[var(--foreground)]">{folder.name}</span>
          <span className="ml-auto shrink-0 text-[10px] text-[var(--foreground-subtle)]">
            {folder.itemCount}
          </span>
        </button>
      ))}

      {/* Divider */}
      {folders.length > 0 && items.length > 0 && (
        <div className="my-1.5 border-t border-[var(--border)]" />
      )}

      {/* Items */}
      {items.map((item) => {
        const meta = ITEM_TYPE_META[item.type];
        const Icon = meta.icon;
        const isActive = item.id === activeTabId;

        return (
          <button
            key={item.id}
            onClick={() => openTab(item)}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
              isActive
                ? "bg-[var(--primary)]/10 font-medium"
                : "hover:bg-[var(--surface-hover)]"
            }`}
          >
            <Icon
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: isActive ? "var(--primary)" : meta.accent }}
            />
            <span
              className="truncate"
              style={{ color: isActive ? "var(--primary)" : "var(--foreground)" }}
            >
              {item.title}
            </span>
            <span className="ml-auto shrink-0 text-[10px] text-[var(--foreground-subtle)]">
              {formatRelativeDate(item.updatedAt)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Placeholder when tabs are open but none is active ────────────────────────
function NoItemSelected() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center p-6">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "var(--gradient-brand-soft)" }}
      >
        <LayoutPanelLeft className="h-7 w-7 text-[var(--primary)]" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--foreground)]">Selecione um item</p>
        <p className="mt-1 text-xs text-[var(--foreground-muted)]">
          Clique em um item no painel esquerdo para abri-lo aqui
        </p>
      </div>
    </div>
  );
}
