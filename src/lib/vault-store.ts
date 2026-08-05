"use client";

import { create } from "zustand";
import type {
  Folder,
  SortDirection,
  SortField,
  VaultItem,
  ViewMode,
  LabelColor,
  ItemType,
} from "@/types";

export interface Tab {
  id: string;
  title: string;
  type: ItemType;
}

import {
  createFolder as apiCreateFolder,
  renameFolder as apiRenameFolder,
  deleteFolder as apiDeleteFolder,
  moveEntities as apiMoveEntities,
  updateFolderColor as apiUpdateFolderColor,
} from "@/actions/folders";

import {
  createNote as apiCreateNote,
  createSnippet as apiCreateSnippet,
  createLink as apiCreateLink,
  renameItem as apiRenameItem,
  toggleFavorite as apiToggleFavorite,
  toggleArchive as apiToggleArchive,
  softDeleteItems as apiSoftDeleteItems,
  createReminder as apiCreateReminder,
  createDiagram as apiCreateDiagram,
} from "@/actions/items";

import { mapFolder, mapItem } from "@/lib/mappers";

interface DragState {
  isDragging: boolean;
  draggedIds: string[];
  draggedKind: "item" | "folder" | null;
  hoveredDropTargetId: string | null; 
}

interface VaultState {
  folders: Folder[];
  items: VaultItem[];

  currentFolderId: string;
  viewMode: ViewMode;
  sortField: SortField;
  sortDirection: SortDirection;

  selectedIds: Set<string>;
  lastSelectedId: string | null;

  drag: DragState;

  // ─── Tab system ───────────────────────────────────────
  openTabs: Tab[];
  activeTabId: string | null;
  openTab: (item: VaultItem) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  closeAllTabs: () => void;
  // ────────────────────────────────────────────────────

  setCurrentFolder: (id: string) => void;

  setViewMode: (mode: ViewMode) => void;
  toggleSort: (field: SortField) => void;

  selectOnly: (id: string) => void;
  toggleSelect: (id: string) => void;
  selectRange: (id: string, orderedIds: string[]) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;

  createFolder: (name: string, parentId: string, color?: string) => Promise<Folder>;
  createNote: (title: string, folderId: string | null, expiresAt?: Date | null) => Promise<VaultItem>;
  createSnippet: (title: string, folderId: string | null, codeLanguage?: string, expiresAt?: Date | null) => Promise<VaultItem>;
  createLink: (title: string, folderId: string | null, url: string, expiresAt?: Date | null) => Promise<VaultItem>;
  createReminder: (title: string, noteContent: string | null, reminderAt: Date, folderId: string | null, expiresAt?: Date | null) => Promise<VaultItem>;
  createDiagram: (title: string, folderId: string | null, expiresAt?: Date | null) => Promise<VaultItem>;

  renameEntity: (id: string, name: string, kind: "item" | "folder") => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  updateFolderColor: (id: string, color: string) => Promise<void>;
  updateItem: (id: string, patch: Partial<VaultItem>) => void;
  addItem: (item: VaultItem) => void;
  toggleFavorite: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  softDelete: (ids: string[]) => Promise<void>;
  moveEntities: (
    itemIds: string[],
    folderIds: string[],
    destinationFolderId: string | null,
  ) => Promise<void>;

  startDrag: (ids: string[], kind: "item" | "folder") => void;
  setDropTarget: (id: string | null) => void;
  endDrag: () => void;

  user: { name: string; email: string; image: string | null } | null;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

function folderChildren(folders: Folder[], parentId: string): Folder[] {
  return folders
    .filter((f) => f.parentId === parentId)
    .sort((a, b) => a.order - b.order);
}

export const useVaultStore = create<VaultState>((set, get) => ({
  folders: [],
  items: [],
  user: null,

  currentFolderId: "root",
  viewMode: "grid",
  sortField: "updatedAt",
  sortDirection: "desc",

  selectedIds: new Set(),
  lastSelectedId: null,
  isSidebarOpen: false,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  // ─── Tab system ───────────────────────────────────────
  openTabs: [],
  activeTabId: null,

  openTab: (item) =>
    set((state) => {
      const existing = state.openTabs.find((t) => t.id === item.id);
      if (existing) {
        return { activeTabId: item.id };
      }
      const newTab: Tab = { id: item.id, title: item.title, type: item.type };
      return { openTabs: [...state.openTabs, newTab], activeTabId: item.id };
    }),

  closeTab: (id) =>
    set((state) => {
      const idx = state.openTabs.findIndex((t) => t.id === id);
      const next = state.openTabs.filter((t) => t.id !== id);
      let nextActiveId: string | null = state.activeTabId;
      if (state.activeTabId === id) {
        // Activate the tab to the left, or right if leftmost
        const prevTab = state.openTabs[idx - 1];
        const nextTab = state.openTabs[idx + 1];
        nextActiveId = prevTab?.id ?? nextTab?.id ?? null;
      }
      return { openTabs: next, activeTabId: nextActiveId };
    }),

  setActiveTab: (id) => set({ activeTabId: id }),

  closeAllTabs: () => set({ openTabs: [], activeTabId: null }),
  // ─────────────────────────────────────────────────────

  drag: {
    isDragging: false,
    draggedIds: [],
    draggedKind: null,
    hoveredDropTargetId: null,
  },

  setCurrentFolder: (id) =>
    set({ currentFolderId: id, selectedIds: new Set(), lastSelectedId: null }),

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleSort: (field) =>
    set((state) => ({
      sortField: field,
      sortDirection:
        state.sortField === field
          ? state.sortDirection === "asc"
            ? "desc"
            : "asc"
          : "asc",
    })),

  selectOnly: (id) => set({ selectedIds: new Set([id]), lastSelectedId: id }),

  toggleSelect: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedIds: next, lastSelectedId: id };
    }),

  selectRange: (id, orderedIds) =>
    set((state) => {
      const anchor = state.lastSelectedId ?? id;
      const from = orderedIds.indexOf(anchor);
      const to = orderedIds.indexOf(id);
      if (from === -1 || to === -1)
        return { selectedIds: new Set([id]), lastSelectedId: id };
      const [start, end] = from < to ? [from, to] : [to, from];
      const range = orderedIds.slice(start, end + 1);
      return { selectedIds: new Set(range), lastSelectedId: id };
    }),

  selectAll: (ids) => set({ selectedIds: new Set(ids) }),

  clearSelection: () => set({ selectedIds: new Set(), lastSelectedId: null }),

  createFolder: async (name, parentId, color) => {
    const rawFolder = await apiCreateFolder({ name, parentId, color });
    const folder = mapFolder(rawFolder);
    set((state) => ({ folders: [...state.folders, folder] }));
    return folder;
  },

  createNote: async (title, folderId, expiresAt) => {
    const rawItem = await apiCreateNote({ title, folderId, expiresAt });
    const item = mapItem(rawItem);
    set((state) => ({
      items: [item, ...state.items],
      folders: state.folders.map((f) =>
        f.id === folderId ? { ...f, itemCount: f.itemCount + 1 } : f
      ),
    }));
    return item;
  },

  createSnippet: async (title, folderId, codeLanguage, expiresAt) => {
    const rawItem = await apiCreateSnippet({ title, folderId, codeLanguage, expiresAt });
    const item = mapItem(rawItem);
    set((state) => ({
      items: [item, ...state.items],
      folders: state.folders.map((f) =>
        f.id === folderId ? { ...f, itemCount: f.itemCount + 1 } : f
      ),
    }));
    return item;
  },

  createLink: async (title, folderId, url, expiresAt) => {
    const rawItem = await apiCreateLink({ title, folderId, url, expiresAt });
    const item = mapItem(rawItem);
    set((state) => ({
      items: [item, ...state.items],
      folders: state.folders.map((f) =>
        f.id === folderId ? { ...f, itemCount: f.itemCount + 1 } : f
      ),
    }));
    return item;
  },

  createReminder: async (title, noteContent, reminderAt, folderId, expiresAt) => {
    const rawItem = await apiCreateReminder(title, noteContent, reminderAt, folderId, expiresAt);
    const item = mapItem(rawItem);
    set((state) => ({
      items: [item, ...state.items],
      folders: state.folders.map((f) =>
        f.id === folderId ? { ...f, itemCount: f.itemCount + 1 } : f
      ),
    }));
    return item;
  },

  createDiagram: async (title, folderId, expiresAt) => {
    const rawItem = await apiCreateDiagram({ title, folderId, expiresAt });
    const item = mapItem(rawItem);
    set((state) => ({
      items: [item, ...state.items],
      folders: state.folders.map((f) =>
        f.id === folderId ? { ...f, itemCount: f.itemCount + 1 } : f
      ),
    }));
    return item;
  },

  renameEntity: async (id, name, kind) => {
    if (kind === "folder") {
      await apiRenameFolder({ id, name });
      set((state) => ({
        folders: state.folders.map((f) =>
          f.id === id ? { ...f, name, updatedAt: new Date() } : f,
        ),
      }));
    } else {
      await apiRenameItem({ id, name });
      set((state) => ({
        items: state.items.map((i) =>
          i.id === id ? { ...i, title: name, updatedAt: new Date() } : i,
        ),
      }));
    }
  },

  deleteFolder: async (id) => {
    await apiDeleteFolder(id);
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
      selectedIds: new Set(),
    }));
  },

  updateFolderColor: async (id, color) => {
    await apiUpdateFolderColor(id, color);
    set((state) => ({
      folders: state.folders.map((f) => (f.id === id ? { ...f, color: color as LabelColor } : f)),
    }));
  },

  updateItem: (id, patch) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, ...patch, updatedAt: new Date() } : i,
      ),
    })),

  addItem: (item) =>
    set((state) => ({
      items: [item, ...state.items],
      folders: state.folders.map((f) =>
        f.id === item.folderId ? { ...f, itemCount: f.itemCount + 1 } : f
      ),
    })),

  toggleFavorite: async (id) => {
    await apiToggleFavorite(id);
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, isFavorite: !i.isFavorite } : i,
      ),
    }));
  },

  toggleArchive: async (id) => {
    await apiToggleArchive(id);
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, isArchived: !i.isArchived } : i,
      ),
    }));
  },

  softDelete: async (ids) => {
    await apiSoftDeleteItems(ids);
    set((state) => {
      const folderDecrements = new Map<string, number>();
      for (const item of state.items) {
        if (ids.includes(item.id) && item.folderId) {
          folderDecrements.set(item.folderId, (folderDecrements.get(item.folderId) ?? 0) + 1);
        }
      }

      // Close any open tabs for the deleted items
      const remainingTabs = state.openTabs.filter((t) => !ids.includes(t.id));
      let nextActiveId = state.activeTabId;
      if (nextActiveId && ids.includes(nextActiveId)) {
        const deletedIdx = state.openTabs.findIndex((t) => t.id === nextActiveId);
        const prev = state.openTabs[deletedIdx - 1];
        const next = state.openTabs[deletedIdx + 1];
        nextActiveId = remainingTabs.find((t) => t.id === prev?.id)?.id
          ?? remainingTabs.find((t) => t.id === next?.id)?.id
          ?? null;
      }

      return {
        items: state.items.filter((i) => !ids.includes(i.id)),
        folders: state.folders.map((f) =>
          folderDecrements.has(f.id)
            ? { ...f, itemCount: Math.max(0, f.itemCount - (folderDecrements.get(f.id) ?? 0)) }
            : f,
        ),
        selectedIds: new Set(),
        openTabs: remainingTabs,
        activeTabId: nextActiveId,
      };
    });
  },

  moveEntities: async (itemIds, folderIds, destinationFolderId) => {
    await apiMoveEntities({ itemIds, folderIds, destinationFolderId });
    set((state) => {
      const folderDecrements = new Map<string, number>();
      let incrementCount = 0;
      for (const item of state.items) {
        if (itemIds.includes(item.id)) {
          if (item.folderId) {
            folderDecrements.set(item.folderId, (folderDecrements.get(item.folderId) ?? 0) + 1);
          }
          incrementCount++;
        }
      }

      return {
        items: state.items.map((i) =>
          itemIds.includes(i.id)
            ? { ...i, folderId: destinationFolderId, updatedAt: new Date() }
            : i,
        ),
        folders: state.folders.map((f) => {
          let nextCount = f.itemCount;
          if (folderDecrements.has(f.id)) {
            nextCount = Math.max(0, nextCount - (folderDecrements.get(f.id) ?? 0));
          }
          if (f.id === destinationFolderId) {
            nextCount += incrementCount;
          }
          const isTargetFolder = folderIds.includes(f.id);
          return isTargetFolder
            ? { ...f, parentId: destinationFolderId, itemCount: nextCount, updatedAt: new Date() }
            : { ...f, itemCount: nextCount };
        }),
        selectedIds: new Set(),
        drag: {
          isDragging: false,
          draggedIds: [],
          draggedKind: null,
          hoveredDropTargetId: null,
        },
      };
    });
  },

  startDrag: (ids, kind) =>
    set({
      drag: {
        isDragging: true,
        draggedIds: ids,
        draggedKind: kind,
        hoveredDropTargetId: null,
      },
    }),

  setDropTarget: (id) =>
    set((state) => ({ drag: { ...state.drag, hoveredDropTargetId: id } })),

  endDrag: () =>
    set({
      drag: {
        isDragging: false,
        draggedIds: [],
        draggedKind: null,
        hoveredDropTargetId: null,
      },
    }),
}));

export function getFolderPath(folders: Folder[], folderId: string): Folder[] {
  const path: Folder[] = [];
  let current = folders.find((f) => f.id === folderId);
  while (current) {
    path.unshift(current);
    current = current.parentId
      ? folders.find((f) => f.id === current!.parentId)
      : undefined;
  }
  return path;
}

export function getChildFolders(folders: Folder[], parentId: string): Folder[] {
  return folderChildren(folders, parentId);
}

export function getItemsInFolder(
  items: VaultItem[],
  folderId: string,
): VaultItem[] {
  const now = new Date();
  return items.filter(
    (i) =>
      i.folderId === folderId &&
      !i.isDeleted &&
      !i.isArchived &&
      // Exclui temporários expirados
      (!i.expiresAt || new Date(i.expiresAt) > now),
  );
}
