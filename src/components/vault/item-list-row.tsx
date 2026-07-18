"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { Folder as FolderIcon, Star } from "lucide-react";
import type { Folder, VaultItem } from "@/types";
import { ITEM_TYPE_META } from "@/lib/item-meta";
import { cn, formatBytes, formatRelativeDate, labelColorHex } from "@/lib/utils";
import { useVaultStore } from "@/lib/vault-store";
import { ItemContextMenu } from "./item-context-menu";

export function FolderListRow({ folder }: { folder: Folder }) {
  const router = useRouter();
  const drag = useVaultStore((s) => s.drag);
  const setDropTarget = useVaultStore((s) => s.setDropTarget);
  const moveEntities = useVaultStore((s) => s.moveEntities);
  const setCurrentFolder = useVaultStore((s) => s.setCurrentFolder);
  const isDropTarget = drag.isDragging && drag.hoveredDropTargetId === folder.id;

  return (
    <ItemContextMenu id={folder.id} kind="folder">
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          useVaultStore.getState().startDrag([folder.id], "folder");
        }}
        onDragEnd={() => useVaultStore.getState().endDrag()}
        onDragOver={(e) => {
          if (!drag.isDragging) return;
          e.preventDefault();
          setDropTarget(folder.id);
        }}
        onDragLeave={() => drag.hoveredDropTargetId === folder.id && setDropTarget(null)}
        onDrop={(e) => {
          e.preventDefault();
          if (!drag.isDragging) return;
          const itemIds = drag.draggedKind === "item" ? drag.draggedIds : [];
          const folderIds = drag.draggedKind === "folder" ? drag.draggedIds.filter((id) => id !== folder.id) : [];
          moveEntities(itemIds, folderIds, folder.id);
        }}
        onClick={() => {
          setCurrentFolder(folder.id);
          router.push(`/vault/folder/${folder.id}`);
        }}
        className={cn(
          "grid cursor-pointer grid-cols-[1fr_100px_90px_160px_120px] items-center gap-4 border-b border-[var(--border)] px-4 py-2.5 text-sm transition-colors hover:bg-[var(--surface-hover)]",
          isDropTarget && "drop-target-active"
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <FolderIcon
            className="h-4 w-4 shrink-0"
            style={{ color: labelColorHex(folder.color) }}
            fill={labelColorHex(folder.color)}
            fillOpacity={0.18}
          />
          <span className="truncate font-medium text-[var(--foreground)]">{folder.name}</span>
        </div>
        <span className="text-[var(--foreground-subtle)]">Pasta</span>
        <span className="text-[var(--foreground-subtle)]">
          {folder.itemCount} {folder.itemCount === 1 ? "item" : "itens"}
        </span>
        <span className="text-[var(--foreground-subtle)]">{formatRelativeDate(folder.updatedAt)}</span>
        <span />
      </div>
    </ItemContextMenu>
  );
}

export function ItemListRow({ item, orderedIds }: { item: VaultItem; orderedIds: string[] }) {
  const router = useRouter();
  const selectedIds = useVaultStore((s) => s.selectedIds);
  const toggleSelect = useVaultStore((s) => s.toggleSelect);
  const selectRange = useVaultStore((s) => s.selectRange);
  const toggleFavorite = useVaultStore((s) => s.toggleFavorite);
  const drag = useVaultStore((s) => s.drag);

  const isSelected = selectedIds.has(item.id);
  const isBeingDragged = drag.isDragging && drag.draggedIds.includes(item.id);
  const meta = ITEM_TYPE_META[item.type];
  const Icon = meta.icon;

  const handleClick = (e: MouseEvent) => {
    if (e.shiftKey) selectRange(item.id, orderedIds);
    else if (e.metaKey || e.ctrlKey) toggleSelect(item.id);
    else router.push(`/vault/item/${item.id}`);
  };

  return (
    <ItemContextMenu id={item.id} kind="item" isFavorite={item.isFavorite}>
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          const ids = isSelected ? Array.from(selectedIds) : [item.id];
          useVaultStore.getState().startDrag(ids, "item");
        }}
        onDragEnd={() => useVaultStore.getState().endDrag()}
        onClick={handleClick}
        className={cn(
          "group grid cursor-pointer grid-cols-[1fr_100px_90px_160px_120px] items-center gap-4 border-b border-[var(--border)] px-4 py-2.5 text-sm transition-colors",
          isSelected ? "bg-[var(--surface-hover)]" : "hover:bg-[var(--surface-hover)]",
          isBeingDragged && "opacity-40"
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Icon className="h-4 w-4 shrink-0" style={{ color: meta.accent }} />
          <span className="truncate text-[var(--foreground)]">{item.title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(item.id);
            }}
            className={cn(
              "shrink-0 transition-opacity",
              item.isFavorite ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <Star
              className="h-3.5 w-3.5 text-[var(--primary)]"
              fill={item.isFavorite ? "currentColor" : "none"}
            />
          </button>
        </div>
        <span className="text-[var(--foreground-subtle)]">{meta.label}</span>
        <span className="text-[var(--foreground-subtle)]">
          {item.fileSize ? formatBytes(item.fileSize) : "—"}
        </span>
        <span className="text-[var(--foreground-subtle)]">{formatRelativeDate(item.updatedAt)}</span>
        <div className="flex items-center gap-1">
          {item.tags.slice(0, 1).map((tag) => (
            <span
              key={tag}
              className="truncate rounded-full bg-[var(--surface-hover)] px-2 py-0.5 text-[11px] text-[var(--foreground-muted)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </ItemContextMenu>
  );
}
