"use client";

import { useState } from "react";
import { ChevronRight, Folder as FolderIcon } from "lucide-react";
import { cn, labelColorHex } from "@/lib/utils";
import { getChildFolders, useVaultStore } from "@/lib/vault-store";
import type { Folder } from "@/types";
import { ItemContextMenu, ItemDropdownMenu } from "./item-context-menu";

export function FolderTreeItem({
  folder,
  depth,
  onNavigate,
}: {
  folder: Folder;
  depth: number;
  onNavigate: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const folders = useVaultStore((s) => s.folders);
  const currentFolderId = useVaultStore((s) => s.currentFolderId);
  const drag = useVaultStore((s) => s.drag);
  const setDropTarget = useVaultStore((s) => s.setDropTarget);
  const moveEntities = useVaultStore((s) => s.moveEntities);

  const children = getChildFolders(folders, folder.id);
  const hasChildren = children.length > 0;
  const isActive = currentFolderId === folder.id;
  const isDropTarget = drag.isDragging && drag.hoveredDropTargetId === folder.id;
  const isBeingDragged = drag.isDragging && drag.draggedIds.includes(folder.id);

  return (
    <ItemContextMenu id={folder.id} kind="folder">
      <div>
        <div
          role="button"
          tabIndex={0}
          draggable={!folder.isRoot}
          onDragStart={(e) => {
            if (folder.isRoot) return;
            e.dataTransfer.effectAllowed = "move";
            useVaultStore.getState().startDrag([folder.id], "folder");
          }}
          onDragEnd={() => useVaultStore.getState().endDrag()}
          onDragOver={(e) => {
            if (!drag.isDragging || isBeingDragged) return;
            e.preventDefault();
            setDropTarget(folder.id);
          }}
          onDragLeave={() => {
            if (drag.hoveredDropTargetId === folder.id) setDropTarget(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (!drag.isDragging) return;
            const itemIds = drag.draggedKind === "item" ? drag.draggedIds : [];
            const folderIds = drag.draggedKind === "folder" ? drag.draggedIds.filter((id) => id !== folder.id) : [];
            moveEntities(itemIds, folderIds, folder.id);
          }}
          onClick={() => onNavigate(folder.id)}
          style={{ paddingLeft: 8 + depth * 16 }}
          className={cn(
            "group flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] pr-2 text-sm transition-colors cursor-pointer",
            isActive
              ? "bg-[var(--surface-hover)] font-medium text-[var(--foreground)]"
              : "text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]",
            isDropTarget && "drop-target-active",
            isBeingDragged && "opacity-40"
          )}
        >
          <button
            type="button"
            aria-label={expanded ? "Recolher pasta" : "Expandir pasta"}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center transition-transform",
              expanded && "rotate-90",
              !hasChildren && "invisible"
            )}
          >
            <ChevronRight className="h-3 w-3" />
          </button>

          <FolderIcon
            className="h-4 w-4 shrink-0"
            style={{ color: labelColorHex(folder.color) }}
            fill={labelColorHex(folder.color)}
            fillOpacity={0.18}
          />

          <span className="flex-1 truncate">{folder.name}</span>

          {folder.itemCount > 0 && (
            <span className="rounded-full bg-[var(--surface-hover)] px-1.5 text-[11px] tabular-nums text-[var(--foreground-subtle)] group-hover:bg-[var(--background)]">
              {folder.itemCount}
            </span>
          )}

          {!folder.isRoot && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ItemDropdownMenu
                id={folder.id}
                kind="folder"
                onOpen={() => onNavigate(folder.id)}
              />
            </div>
          )}
        </div>

        {expanded && hasChildren && (
          <div>
            {children.map((child) => (
              <FolderTreeItem key={child.id} folder={child} depth={depth + 1} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    </ItemContextMenu>
  );
}
