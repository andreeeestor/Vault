"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FolderInput, Folder as FolderIcon, ChevronRight, Home, Search } from "lucide-react";
import { useVaultStore } from "@/lib/vault-store";
import { labelColorHex } from "@/lib/utils";
import { toast } from "sonner";
import type { Folder } from "@/types";

interface MoveModalProps {
  open: boolean;
  /** IDs dos itens a mover */
  itemIds?: string[];
  /** IDs das pastas a mover */
  folderIds?: string[];
  /** Chamado quando modal é fechado sem ação */
  onClose: () => void;
}

export function MoveModal({ open, itemIds = [], folderIds = [], onClose }: MoveModalProps) {
  const folders = useVaultStore((s) => s.folders);
  const moveEntities = useVaultStore((s) => s.moveEntities);
  const clearSelection = useVaultStore((s) => s.clearSelection);

  const [browsedFolderId, setBrowsedFolderId] = useState<string | null>(null);
  const [selectedDestId, setSelectedDestId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isMoving, setIsMoving] = useState(false);

  // Reset when modal opens
  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setBrowsedFolderId(null);
      setSelectedDestId(null);
      setSearch("");
      onClose();
    }
  };

  // Breadcrumb trail to current browsed folder
  const breadcrumb = useMemo(() => {
    if (!browsedFolderId) return [];
    const trail: Folder[] = [];
    let current = folders.find((f) => f.id === browsedFolderId);
    while (current && !current.isRoot) {
      trail.unshift(current);
      current = folders.find((f) => f.id === current!.parentId);
    }
    return trail;
  }, [browsedFolderId, folders]);

  // Items forbidden as destination (the things being moved, and their descendants)
  const forbiddenIds = useMemo(() => {
    const forbidden = new Set<string>([...itemIds, ...folderIds]);
    // Add all descendants of moved folders
    const addDescendants = (id: string) => {
      folders.filter((f) => f.parentId === id).forEach((f) => {
        forbidden.add(f.id);
        addDescendants(f.id);
      });
    };
    folderIds.forEach(addDescendants);
    return forbidden;
  }, [itemIds, folderIds, folders]);

  // Folders visible in current browsed level
  const visibleFolders = useMemo(() => {
    const children = folders.filter(
      (f) => !f.isRoot && f.parentId === browsedFolderId && !forbiddenIds.has(f.id)
    );
    if (!search.trim()) return children;
    const q = search.toLowerCase();
    return folders.filter(
      (f) => !f.isRoot && !forbiddenIds.has(f.id) && f.name.toLowerCase().includes(q)
    );
  }, [folders, browsedFolderId, forbiddenIds, search]);

  const handleMove = async () => {
    setIsMoving(true);
    try {
      await moveEntities(itemIds, folderIds, selectedDestId);
      clearSelection();
      toast.success("Movido com sucesso!");
      handleOpenChange(false);
    } catch {
      toast.error("Erro ao mover. Tente novamente.");
    } finally {
      setIsMoving(false);
    }
  };

  const totalCount = itemIds.length + folderIds.length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showClose className="max-w-md gap-0 p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)]/10">
            <FolderInput className="h-4.5 w-4.5 text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Mover para…</h3>
            <p className="text-xs text-[var(--foreground-muted)]">
              {totalCount} {totalCount === 1 ? "item selecionado" : "itens selecionados"}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="border-b border-[var(--border)] px-4 py-2.5">
          <div className="flex items-center gap-2 rounded-lg bg-[var(--surface)] px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-[var(--foreground-subtle)]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value) setBrowsedFolderId(null);
              }}
              placeholder="Buscar pasta…"
              className="flex-1 bg-transparent text-xs text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-subtle)]"
            />
          </div>
        </div>

        {/* Breadcrumb */}
        {!search && (
          <div className="flex items-center gap-1 overflow-x-auto border-b border-[var(--border)] px-4 py-2" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => { setBrowsedFolderId(null); setSelectedDestId(null); }}
              className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-xs transition-colors hover:bg-[var(--surface-hover)]"
            >
              <Home className="h-3 w-3" />
              <span className="text-[var(--foreground-muted)]">Meu Vault</span>
            </button>
            {breadcrumb.map((folder) => (
              <div key={folder.id} className="flex shrink-0 items-center">
                <ChevronRight className="h-3 w-3 text-[var(--foreground-subtle)]" />
                <button
                  onClick={() => { setBrowsedFolderId(folder.id); setSelectedDestId(null); }}
                  className="rounded-md px-1.5 py-1 text-xs text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                >
                  {folder.name}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Folder list */}
        <div className="max-h-64 overflow-y-auto p-2">
          {/* "Root / Meu Vault" as a destination option */}
          {!search && (
            <FolderRow
              label="Meu Vault"
              color={null}
              isSelected={selectedDestId === null && browsedFolderId === null}
              hasChildren={false}
              onSelect={() => {
                setSelectedDestId(null);
                setBrowsedFolderId(null);
              }}
              onNavigate={null}
            />
          )}

          {visibleFolders.length === 0 && (
            <p className="py-6 text-center text-xs text-[var(--foreground-subtle)]">
              {search ? "Nenhuma pasta encontrada" : "Sem subpastas aqui"}
            </p>
          )}

          {visibleFolders.map((folder) => {
            const hasChildren = folders.some(
              (f) => f.parentId === folder.id && !f.isRoot && !forbiddenIds.has(f.id)
            );
            return (
              <FolderRow
                key={folder.id}
                label={folder.name}
                color={folder.color ?? null}
                isSelected={selectedDestId === folder.id}
                hasChildren={hasChildren}
                onSelect={() => setSelectedDestId(folder.id)}
                onNavigate={hasChildren ? () => {
                  setBrowsedFolderId(folder.id);
                  setSelectedDestId(folder.id);
                  setSearch("");
                } : null}
              />
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-4">
          <span className="truncate text-xs text-[var(--foreground-muted)]">
            {selectedDestId
              ? `→ ${folders.find((f) => f.id === selectedDestId)?.name ?? "…"}`
              : browsedFolderId
              ? `→ ${folders.find((f) => f.id === browsedFolderId)?.name ?? "…"}`
              : "→ Meu Vault (raiz)"}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              disabled={isMoving}
              onClick={handleMove}
              className="bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
            >
              {isMoving ? "Movendo…" : "Mover aqui"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FolderRow({
  label,
  color,
  isSelected,
  hasChildren,
  onSelect,
  onNavigate,
}: {
  label: string;
  color: string | null;
  isSelected: boolean;
  hasChildren: boolean;
  onSelect: () => void;
  onNavigate: (() => void) | null;
}) {
  return (
    <div
      onClick={onSelect}
      onDoubleClick={() => {
        if (hasChildren && onNavigate) onNavigate();
      }}
      className={`group flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors ${
        isSelected
          ? "bg-[var(--primary)]/10 text-[var(--primary)] font-medium"
          : "hover:bg-[var(--surface-hover)] text-[var(--foreground)]"
      }`}
    >
      <FolderIcon
        className="h-4 w-4 shrink-0"
        style={{ color: color ? labelColorHex(color as Parameters<typeof labelColorHex>[0]) : "var(--foreground-subtle)" }}
      />
      <span className="flex-1 truncate text-sm">{label}</span>
      {hasChildren && onNavigate && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate();
          }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--foreground-subtle)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors"
          title="Abrir pasta (ou clique duplo)"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
