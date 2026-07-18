"use client";

import { ChevronDown, ChevronUp, FolderOpen } from "lucide-react";
import type { Folder, SortField, VaultItem } from "@/types";
import { useVaultStore } from "@/lib/vault-store";
import { cn } from "@/lib/utils";
import { FolderListRow, ItemListRow } from "./item-list-row";
import { EmptyState } from "./empty-state";

const COLUMNS: { field: SortField; label: string }[] = [
  { field: "name", label: "Nome" },
  { field: "type", label: "Tipo" },
  { field: "fileSize", label: "Tamanho" },
  { field: "updatedAt", label: "Modificado em" },
];

export function ItemList({ folders, items }: { folders: Folder[]; items: VaultItem[] }) {
  const sortField = useVaultStore((s) => s.sortField);
  const sortDirection = useVaultStore((s) => s.sortDirection);
  const toggleSort = useVaultStore((s) => s.toggleSort);
  const orderedIds = [...folders.map((f) => f.id), ...items.map((i) => i.id)];

  if (folders.length === 0 && items.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="Esta pasta está vazia"
        description="Envie um arquivo, crie uma nota ou arraste itens aqui para começar a organizar."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
      <div className="grid grid-cols-[1fr_100px_90px_160px_120px] gap-4 border-b border-[var(--border)] bg-[var(--background-elevated)] px-4 py-2 text-xs font-medium text-[var(--foreground-subtle)]">
        {COLUMNS.map(({ field, label }) => (
          <button
            key={field}
            onClick={() => toggleSort(field)}
            className={cn(
              "flex items-center gap-1 text-left uppercase tracking-wide transition-colors hover:text-[var(--foreground)]",
              field === "type" && "col-start-2"
            )}
          >
            {label}
            {sortField === field &&
              (sortDirection === "asc" ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              ))}
          </button>
        ))}
        <span className="uppercase tracking-wide">Tags</span>
      </div>

      <div>
        {folders.map((folder) => (
          <FolderListRow key={folder.id} folder={folder} />
        ))}
        {items.map((item) => (
          <ItemListRow key={item.id} item={item} orderedIds={orderedIds} />
        ))}
      </div>
    </div>
  );
}
