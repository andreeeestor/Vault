"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Files, Folder as FolderIcon, FolderOpen, HardDrive, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import type { Folder, VaultItem } from "@/types";
import { cn, formatBytes, labelColorHex } from "@/lib/utils";
import { getItemsInFolder, useVaultStore } from "@/lib/vault-store";
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
      className="grid auto-rows-[230px] gap-3 sm:gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(135px, 1fr))" }}
    >
      {folders.map((folder) => (
        <FolderCard key={folder.id} folder={folder} orderedIds={orderedIds} />
      ))}
      {items.map((item) => (
        <ItemCard key={item.id} item={item} orderedIds={orderedIds} />
      ))}
    </div>
  );
}

function FolderCard({ folder, orderedIds }: { folder: Folder; orderedIds: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  // Reset do estado de navegação quando a rota muda (entrada na pasta concluída)
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);
  const selectedIds = useVaultStore((s) => s.selectedIds);
  const toggleSelect = useVaultStore((s) => s.toggleSelect);
  const selectRange = useVaultStore((s) => s.selectRange);
  const drag = useVaultStore((s) => s.drag);
  const setDropTarget = useVaultStore((s) => s.setDropTarget);
  const moveEntities = useVaultStore((s) => s.moveEntities);
  const setCurrentFolder = useVaultStore((s) => s.setCurrentFolder);

  const isSelected = selectedIds.has(folder.id);
  const storeItems = useVaultStore((s) => s.items);
  const folderItems = getItemsInFolder(storeItems, folder.id);
  const folderSize = folderItems.reduce((acc, item) => acc + (item.fileSize ?? 0), 0);
  const folderColor = labelColorHex(folder.color) || "#5227FF";
  const folderTint = `${folderColor}1F`;

  const isDropTarget = drag.isDragging && drag.hoveredDropTargetId === folder.id;
  const isBeingDragged = drag.isDragging && drag.draggedIds.includes(folder.id);

  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      selectRange(folder.id, orderedIds);
      return;
    }
    if (e.metaKey || e.ctrlKey) {
      toggleSelect(folder.id);
      return;
    }
    if (selectedIds.size > 0) {
      toggleSelect(folder.id);
      return;
    }
    setIsNavigating(true);
    setCurrentFolder(folder.id);
    router.push(`/vault/folder/${folder.id}`);
  };

  return (
    <ItemContextMenu id={folder.id} kind="folder">
      <motion.div
        layout
        draggable
        onDragStart={(e) => {
          const dragEvent = e as unknown as React.DragEvent;
          dragEvent.dataTransfer.effectAllowed = "move";
          const ids = isSelected ? Array.from(selectedIds) : [folder.id];
          useVaultStore.getState().startDrag(ids, "folder");
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
        onMouseDown={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey) e.preventDefault();
        }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("button, [role='menu'], [role='menuitem'], [data-radix-popper-content-wrapper], input, select")) {
            return;
          }
          handleClick(e);
        }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", bounce: 0, duration: 0.25 }}
        className="group relative h-full cursor-pointer pt-[10px]"
      >
        {/* Aba da pasta (atrás do corpo) */}
        <div
          aria-hidden
          className={cn(
            "absolute top-0 left-3 h-[22px] w-[58%] rounded-t-[10px] border border-b-0 transition-colors",
            isSelected ? "border-[var(--primary)]" : "border-[var(--border)]"
          )}
          style={{ backgroundColor: folderTint }}
        />
        {/* Corpo da pasta */}
        <div
          className={cn(
            "relative flex h-full flex-col rounded-[14px] rounded-tl-[6px] border p-4 shadow-[var(--shadow-sm)] transition-shadow group-hover:shadow-[var(--shadow-md)]",
            isSelected ? "border-[var(--primary)] ring-2 ring-[var(--ring)]" : isDropTarget ? "drop-target-active" : "border-[var(--border)]",
            isBeingDragged && "opacity-40"
          )}
          style={{ background: `linear-gradient(160deg, ${folderTint}, var(--surface) 55%)` }}
        >
          {isNavigating && (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[14px] rounded-tl-[6px] bg-[var(--surface)]/70 backdrop-blur-[2px]">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--primary)]" />
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <FolderIcon className="size-4 shrink-0" style={{ color: folderColor }} />
              <h3 className="truncate text-sm font-semibold text-[var(--foreground)]">
                {folder.name}
              </h3>
            </div>
            <ItemDropdownMenu
              id={folder.id}
              kind="folder"
              onOpen={() => {
                setCurrentFolder(folder.id);
                router.push(`/vault/folder/${folder.id}`);
              }}
            />
          </div>

          <div className="mt-auto space-y-1.5">
            <FolderStatRow
              icon={Files}
              label="Itens"
              value={String(folder.itemCount)}
            />
            <FolderStatRow
              icon={HardDrive}
              label="Armazenamento"
              value={formatBytes(folderSize)}
            />
          </div>
        </div>
      </motion.div>
    </ItemContextMenu>
  );
}

function FolderStatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className="size-3.5 shrink-0 text-[var(--foreground-subtle)]" />
      <span className="shrink-0 text-[var(--foreground-subtle)]">{label}</span>
      <span className="mx-1 flex-1 border-b border-dashed border-[var(--border)]" />
      <span className="shrink-0 text-xs font-semibold text-[var(--foreground)]">{value}</span>
    </div>
  );
}
