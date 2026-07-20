"use client";

import { create } from "zustand";
import type {
  Folder,
  SortDirection,
  SortField,
  VaultItem,
  ViewMode,
} from "@/types";

// Importa as server actions reais para conectar o estado ao banco
import {
  createFolder as apiCreateFolder,
  renameFolder as apiRenameFolder,
  deleteFolder as apiDeleteFolder,
  moveEntities as apiMoveEntities,
} from "@/actions/folders";

import {
  createNote as apiCreateNote,
  createSnippet as apiCreateSnippet,
  createLink as apiCreateLink,
  renameItem as apiRenameItem,
  toggleFavorite as apiToggleFavorite,
  toggleArchive as apiToggleArchive,
  softDeleteItems as apiSoftDeleteItems,
} from "@/actions/items";

import { mapFolder, mapItem } from "@/lib/mappers";

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

  // CRUD real conectado ao banco de dados via Server Actions
  createFolder: (name: string, parentId: string) => Promise<Folder>;
  createNote: (title: string, folderId: string | null) => Promise<VaultItem>;
  createSnippet: (title: string, folderId: string | null, codeLanguage?: string) => Promise<VaultItem>;
  createLink: (title: string, folderId: string | null, url: string) => Promise<VaultItem>;
  
  renameEntity: (id: string, name: string, kind: "item" | "folder") => Promise<void>;
  updateItem: (id: string, patch: Partial<VaultItem>) => void;
  toggleFavorite: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  softDelete: (ids: string[]) => Promise<void>;
  moveEntities: (
    itemIds: string[],
    folderIds: string[],
    destinationFolderId: string | null,
  ) => Promise<void>;

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

  createFolder: async (name, parentId) => {
    const rawFolder = await apiCreateFolder({ name, parentId });
    const folder = mapFolder(rawFolder);
    set((state) => ({ folders: [...state.folders, folder] }));
    return folder;
  },

  createNote: async (title, folderId) => {
    const rawItem = await apiCreateNote({ title, folderId });
    const item = mapItem(rawItem);
    set((state) => ({ items: [item, ...state.items] }));
    return item;
  },

  createSnippet: async (title, folderId, codeLanguage) => {
    const rawItem = await apiCreateSnippet({ title, folderId, codeLanguage });
    const item = mapItem(rawItem);
    set((state) => ({ items: [item, ...state.items] }));
    return item;
  },

  createLink: async (title, folderId, url) => {
    const rawItem = await apiCreateLink({ title, folderId, url });
    const item = mapItem(rawItem);
    set((state) => ({ items: [item, ...state.items] }));
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

  updateItem: (id, patch) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, ...patch, updatedAt: new Date() } : i,
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
    set((state) => ({
      items: state.items.map((i) =>
        ids.includes(i.id)
          ? { ...i, isDeleted: true, deletedAt: new Date() }
          : i,
      ),
      selectedIds: new Set(),
    }));
  },

  moveEntities: async (itemIds, folderIds, destinationFolderId) => {
    await apiMoveEntities({ itemIds, folderIds, destinationFolderId });
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
    }));
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
