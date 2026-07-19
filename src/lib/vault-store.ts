"use client";

import { create } from "zustand";
import type {
  Folder,
  SortDirection,
  SortField,
  VaultItem,
  ViewMode,
} from "@/types";

interface DragState {
  isDragging: boolean;
  draggedIds: string[];
  draggedKind: "item" | "folder" | null;
  hoveredDropTargetId: string | null; // folderId ou "breadcrumb:<id>"
}

interface VaultState {
  folders: Folder[];
  items: VaultItem[];

  currentFolderId: string; // "root" por padrão
  viewMode: ViewMode;
  sortField: SortField;
  sortDirection: SortDirection;

  selectedIds: Set<string>;
  lastSelectedId: string | null;

  drag: DragState;

  // navegação
  setCurrentFolder: (id: string) => void;

  // visão
  setViewMode: (mode: ViewMode) => void;
  toggleSort: (field: SortField) => void;

  // seleção
  selectOnly: (id: string) => void;
  toggleSelect: (id: string) => void;
  selectRange: (id: string, orderedIds: string[]) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;

  // CRUD básico (client-side, otimista — plugar em server actions depois)
  createFolder: (name: string, parentId: string) => Folder;
  renameEntity: (id: string, name: string, kind: "item" | "folder") => void;
  updateItem: (id: string, patch: Partial<VaultItem>) => void;
  toggleFavorite: (id: string) => void;
  toggleArchive: (id: string) => void;
  softDelete: (ids: string[]) => void;
  moveEntities: (
    itemIds: string[],
    folderIds: string[],
    destinationFolderId: string,
  ) => void;

  // drag & drop
  startDrag: (ids: string[], kind: "item" | "folder") => void;
  setDropTarget: (id: string | null) => void;
  endDrag: () => void;
}

function folderChildren(folders: Folder[], parentId: string): Folder[] {
  return folders
    .filter((f) => f.parentId === parentId)
    .sort((a, b) => a.order - b.order);
}

export const useVaultStore = create<VaultState>((set, get) => ({
  folders: [],
  items: [],

  currentFolderId: "root",
  viewMode: "grid",
  sortField: "updatedAt",
  sortDirection: "desc",

  selectedIds: new Set(),
  lastSelectedId: null,

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

  createFolder: (name, parentId) => {
    const folder: Folder = {
      id: `folder-${crypto.randomUUID()}`,
      userId: "demo-user",
      name,
      description: null,
      color: "violet",
      icon: "folder",
      parentId,
      order: folderChildren(get().folders, parentId).length,
      isRoot: false,
      itemCount: 0,
      folderCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ folders: [...state.folders, folder] }));
    return folder;
  },

  renameEntity: (id, name, kind) =>
    set((state) =>
      kind === "folder"
        ? {
            folders: state.folders.map((f) =>
              f.id === id ? { ...f, name, updatedAt: new Date() } : f,
            ),
          }
        : {
            items: state.items.map((i) =>
              i.id === id ? { ...i, title: name, updatedAt: new Date() } : i,
            ),
          },
    ),

  updateItem: (id, patch) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, ...patch, updatedAt: new Date() } : i,
      ),
    })),

  toggleFavorite: (id) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, isFavorite: !i.isFavorite } : i,
      ),
    })),

  toggleArchive: (id) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, isArchived: !i.isArchived } : i,
      ),
    })),

  softDelete: (ids) =>
    set((state) => ({
      items: state.items.map((i) =>
        ids.includes(i.id)
          ? { ...i, isDeleted: true, deletedAt: new Date() }
          : i,
      ),
      selectedIds: new Set(),
    })),

  moveEntities: (itemIds, folderIds, destinationFolderId) =>
    set((state) => ({
      items: state.items.map((i) =>
        itemIds.includes(i.id)
          ? { ...i, folderId: destinationFolderId, updatedAt: new Date() }
          : i,
      ),
      folders: state.folders.map((f) =>
        folderIds.includes(f.id)
          ? { ...f, parentId: destinationFolderId, updatedAt: new Date() }
          : f,
      ),
      selectedIds: new Set(),
      drag: {
        isDragging: false,
        draggedIds: [],
        draggedKind: null,
        hoveredDropTargetId: null,
      },
    })),

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

// Seletores derivados -------------------------------------------------------

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
  return items.filter(
    (i) => i.folderId === folderId && !i.isDeleted && !i.isArchived,
  );
}
