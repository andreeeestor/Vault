"use client";

import { useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { BreadcrumbNav } from "./breadcrumb-nav";
import { ItemGrid } from "./item-grid";
import { ItemList } from "./item-list";
import { SelectionToolbar } from "./selection-toolbar";
import { getChildFolders, getItemsInFolder, useVaultStore } from "@/lib/vault-store";
import type { Folder, SortField, VaultItem } from "@/types";

function sortFolders(folders: Folder[], field: SortField, dir: "asc" | "desc"): Folder[] {
  const sorted = [...folders].sort((a, b) => {
    if (field === "name") return a.name.localeCompare(b.name);
    if (field === "updatedAt") return a.updatedAt.getTime() - b.updatedAt.getTime();
    return 0;
  });
  return dir === "asc" ? sorted : sorted.reverse();
}

function sortItems(items: VaultItem[], field: SortField, dir: "asc" | "desc"): VaultItem[] {
  const sorted = [...items].sort((a, b) => {
    if (field === "name") return a.title.localeCompare(b.title);
    if (field === "updatedAt") return a.updatedAt.getTime() - b.updatedAt.getTime();
    if (field === "type") return a.type.localeCompare(b.type);
    if (field === "fileSize") return (a.fileSize ?? 0) - (b.fileSize ?? 0);
    return 0;
  });
  return dir === "asc" ? sorted : sorted.reverse();
}

export function VaultFolderView({ folderId }: { folderId: string }) {
  const folders = useVaultStore((s) => s.folders);
  const items = useVaultStore((s) => s.items);
  const viewMode = useVaultStore((s) => s.viewMode);
  const sortField = useVaultStore((s) => s.sortField);
  const sortDirection = useVaultStore((s) => s.sortDirection);
  const setCurrentFolder = useVaultStore((s) => s.setCurrentFolder);
  const selectAll = useVaultStore((s) => s.selectAll);
  const clearSelection = useVaultStore((s) => s.clearSelection);

  useEffect(() => {
    setCurrentFolder(folderId);
  }, [folderId, setCurrentFolder]);

  const childFolders = sortFolders(getChildFolders(folders, folderId), sortField, sortDirection);
  const folderItems = sortItems(getItemsInFolder(items, folderId), sortField, sortDirection);

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

  return (
    <>
      <DashboardHeader breadcrumb={<BreadcrumbNav />} />
      <main className="flex-1 p-6" onClick={(e) => e.currentTarget === e.target && clearSelection()}>
        {viewMode === "grid" ? (
          <ItemGrid folders={childFolders} items={folderItems} />
        ) : (
          <ItemList folders={childFolders} items={folderItems} />
        )}
      </main>
      <SelectionToolbar />
    </>
  );
}
