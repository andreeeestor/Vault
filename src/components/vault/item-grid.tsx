"use client";

import { useRouter } from "next/navigation";
import { Folder as FolderIcon, FolderOpen, MoreHorizontal } from "lucide-react";
import { motion } from "motion/react";
import type { Folder, VaultItem } from "@/types";
import { cn, labelColorHex } from "@/lib/utils";
import { useVaultStore } from "@/lib/vault-store";
import { ItemContextMenu, ItemDropdownMenu } from "./item-context-menu";
import { ItemCard } from "./item-card";
import { EmptyState } from "./empty-state";

export function ItemGrid({ folders, items }: { folders: Folder[]; items: VaultItem[] }) {
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
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
    >
      {folders.map((folder) => (
        <FolderCard key={folder.id} folder={folder} />
      ))}
      {items.map((item) => (
        <ItemCard key={item.id} item={item} orderedIds={orderedIds} />
      ))}
    </div>
  );
}

function FolderCard({ folder }: { folder: Folder }) {
  const router = useRouter();
  const drag = useVaultStore((s) => s.drag);
  const setDropTarget = useVaultStore((s) => s.setDropTarget);
  const moveEntities = useVaultStore((s) => s.moveEntities);
  const setCurrentFolder = useVaultStore((s) => s.setCurrentFolder);

  const isDropTarget = drag.isDragging && drag.hoveredDropTargetId === folder.id;
  const isBeingDragged = drag.isDragging && drag.draggedIds.includes(folder.id);

  return (
    <ItemContextMenu id={folder.id} kind="folder">
      <motion.div
        layout
        draggable
        onDragStart={(e) => {
          const dragEvent = e as unknown as React.DragEvent;
          dragEvent.dataTransfer.effectAllowed = "move";
          useVaultStore.getState().startDrag([folder.id], "folder");
        }}
        onDragEnd={() => useVaultStore.getState().endDrag()}
        onDragOver={(e) => {
          if (!drag.isDragging || isBeingDragged) return;
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
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", bounce: 0, duration: 0.25 }}
        className={cn(
          "group flex cursor-pointer flex-col gap-3 rounded-[var(--radius-lg)] border bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]",
          isDropTarget ? "drop-target-active" : "border-[var(--border)]",
          isBeingDragged && "opacity-40"
        )}
      >
        <div className="flex items-start justify-between">
          <FolderIcon
            className="h-9 w-9"
            style={{ color: labelColorHex(folder.color) }}
            fill={labelColorHex(folder.color)}
            fillOpacity={0.18}
            strokeWidth={1.5}
          />
          <ItemDropdownMenu
            id={folder.id}
            kind="folder"
            onOpen={() => {
              setCurrentFolder(folder.id);
              router.push(`/vault/folder/${folder.id}`);
            }}
          />
        </div>
        <div>
          <h3 className="truncate text-sm font-medium text-[var(--foreground)]">{folder.name}</h3>
          <p className="text-caption mt-0.5 text-xs text-[var(--foreground-subtle)]">
            {folder.itemCount} {folder.itemCount === 1 ? "item" : "itens"}
          </p>
        </div>
      </motion.div>
    </ItemContextMenu>
  );
}
