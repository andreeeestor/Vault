"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { Star } from "lucide-react";
import { motion } from "motion/react";
import type { VaultItem } from "@/types";
import { ITEM_TYPE_META } from "@/lib/item-meta";
import { cn, formatRelativeDate, labelColorHex } from "@/lib/utils";
import { useVaultStore } from "@/lib/vault-store";
import { ItemContextMenu, ItemDropdownMenu } from "./item-context-menu";
import { Badge } from "@/components/ui/badge";

export function ItemCard({ item, orderedIds }: { item: VaultItem; orderedIds: string[] }) {
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

  const handleMouseDown = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) e.preventDefault();
  };

  return (
    <ItemContextMenu id={item.id} kind="item" isFavorite={item.isFavorite}>
      <motion.div
        layout
        draggable
        onDragStart={(e) => {
          const dragEvent = e as unknown as React.DragEvent;
          dragEvent.dataTransfer.effectAllowed = "move";
          const ids = isSelected ? Array.from(selectedIds) : [item.id];
          useVaultStore.getState().startDrag(ids, "item");
        }}
        onDragEnd={() => useVaultStore.getState().endDrag()}
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey) return handleClick(e);
          handleClick(e);
        }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", bounce: 0, duration: 0.25 }}
        className={cn(
          "group relative flex cursor-pointer flex-col overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--surface)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]",
          isSelected ? "border-[var(--primary)] ring-2 ring-[var(--ring)]" : "border-[var(--border)]",
          isBeingDragged && "opacity-40"
        )}
      >
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
          <button
            aria-label={item.isFavorite ? "Remover dos favoritos" : "Favoritar"}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(item.id);
            }}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg bg-black/35 backdrop-blur-sm text-white transition-opacity",
              item.isFavorite ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <Star
              className="h-3.5 w-3.5"
              fill={item.isFavorite ? "white" : "none"}
            />
          </button>

          <div className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg bg-black/35 backdrop-blur-sm text-white transition-opacity",
            "opacity-0 group-hover:opacity-100"
          )}>
            <ItemDropdownMenu
              id={item.id}
              kind="item"
              isFavorite={item.isFavorite}
              onOpen={() => router.push(`/vault/item/${item.id}`)}
            />
          </div>
        </div>

        <ItemPreview item={item} />

        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <div className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: meta.accent }} />
            <h3 className="truncate text-sm font-medium text-[var(--foreground)]">{item.title}</h3>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-caption text-xs text-[var(--foreground-subtle)]">
              {formatRelativeDate(item.updatedAt)}
            </span>
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: labelColorHex(item.color) }}
            />
          </div>

          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {item.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} className="px-1.5 py-0 text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </ItemContextMenu>
  );
}

function ItemPreview({ item }: { item: VaultItem }) {
  const meta = ITEM_TYPE_META[item.type];
  const Icon = meta.icon;

  if (item.type === "IMAGE" && item.url) {
    return (
      
      <img
        src={item.url}
        alt={item.title}
        className="h-40 w-full object-cover"
        loading="lazy"
      />
    );
  }

  if (item.type === "LINK" && item.linkOgImage) {
    return (
      
      <img src={item.linkOgImage} alt={item.title} className="h-32 w-full object-cover" loading="lazy" />
    );
  }

  if (item.type === "NOTE" && item.noteContent) {
    return (
      <div className="h-32 w-full overflow-hidden bg-[var(--background-elevated)] p-3">
        <p className="text-caption line-clamp-5 text-xs text-[var(--foreground-muted)] whitespace-pre-line">
          {item.noteContent.replace(/^#+\s*/gm, "")}
        </p>
      </div>
    );
  }

  if (item.type === "SNIPPET" && item.codeContent) {
    return (
      <div className="h-32 w-full overflow-hidden bg-[#1E1B2E] p-3">
        <pre className="text-[10px] leading-relaxed text-violet-200">
          <code>{item.codeContent.slice(0, 220)}</code>
        </pre>
      </div>
    );
  }

  return (
    <div
      className="flex h-32 w-full items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${meta.accent}14, ${meta.accent}05)` }}
    >
      <Icon className="h-9 w-9" style={{ color: meta.accent }} strokeWidth={1.5} />
    </div>
  );
}
