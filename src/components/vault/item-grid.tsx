"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Clock,
  Files,
  Folder as FolderIcon,
  FolderOpen,
  HardDrive,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import type { Folder, VaultItem } from "@/types";
import {
  cn,
  formatBytes,
  formatRelativeDate,
  labelColorHex,
} from "@/lib/utils";
import { getItemsInFolder, useVaultStore } from "@/lib/vault-store";
import { ITEM_TYPE_META } from "@/lib/item-meta";
import { MiniItemThumbnail } from "./mini-item-thumbnail";
import { ItemContextMenu, ItemDropdownMenu } from "./item-context-menu";
import { ItemCard } from "./item-card";
import { EmptyState } from "./empty-state";

export function ItemGrid({
  folders,
  items,
}: {
  folders: Folder[];
  items: VaultItem[];
}) {
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
      className="grid auto-rows-[150px] gap-3 sm:gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))" }}
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

function FolderCard({
  folder,
  orderedIds,
}: {
  folder: Folder;
  orderedIds: string[];
}) {
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
  const folderSize = folderItems.reduce(
    (acc, item) => acc + (item.fileSize ?? 0),
    0
  );
  const folderColor = labelColorHex(folder.color) || "#5227FF";
  const topItems = folderItems.slice(0, 3);

  const isDropTarget =
    drag.isDragging && drag.hoveredDropTargetId === folder.id;
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
        onDragLeave={() =>
          drag.hoveredDropTargetId === folder.id && setDropTarget(null)
        }
        onDrop={(e) => {
          e.preventDefault();
          if (!drag.isDragging) return;
          const itemIds = drag.draggedKind === "item" ? drag.draggedIds : [];
          const folderIds =
            drag.draggedKind === "folder"
              ? drag.draggedIds.filter((id) => id !== folder.id)
              : [];
          moveEntities(itemIds, folderIds, folder.id);
        }}
        onMouseDown={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey) e.preventDefault();
        }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (
            target.closest(
              "button, [role='menu'], [role='menuitem'], [data-radix-popper-content-wrapper], input, select"
            )
          ) {
            return;
          }
          handleClick(e);
        }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", bounce: 0, duration: 0.25 }}
        className={cn(
          "group relative h-full cursor-pointer pt-[9px] hover:z-40",
          isSelected && "[&_.folder-frame]:ring-2 [&_.folder-frame]:ring-[var(--ring)] [&_.folder-tab]:border-[var(--primary)]",
          isDropTarget && "[&_.folder-frame]:drop-target-active",
          isBeingDragged && "opacity-40"
        )}
      >
        {/* Aba da pasta (fundo) */}
        <div
          aria-hidden
          className="folder-tab absolute top-0 left-2.5 z-0 h-[18px] w-[52%] rounded-t-[9px] border border-b-0 bg-[var(--surface)]"
          style={{ borderColor: `${folderColor}40` }}
        />

        {/* Painel de fundo com neon discreto (visível quando a capa abre) */}
        <div
          aria-hidden
          className="folder-frame absolute inset-x-0 bottom-0 top-[9px] z-0 rounded-[12px] rounded-tl-[5px] border bg-[var(--surface)]"
          style={{
            borderColor: `${folderColor}40`,
            boxShadow: `0 0 6px ${folderColor}1F, var(--shadow-sm)`,
          }}
        >
          {/* Glow interno sutil */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[11px] rounded-tl-[4px]"
            style={{ boxShadow: `inset 0 0 12px ${folderColor}14` }}
          />
        </div>

        {/* Papéis com thumbnails — aparecem acima da pasta e se espalham ao abrir (estilo ReactBits) */}
        {topItems.map((item, i) => {
          const meta = ITEM_TYPE_META[item.type];
          const TypeIcon = meta.icon;
          return (
            <div
              key={item.id}
              className={cn(
                "absolute bottom-[70%] left-1/2 z-999 h-13 w-[64%] origin-bottom overflow-hidden rounded-md border border-black/10 bg-[var(--surface)] shadow-md",
                "opacity-0 transition-all duration-300 ease-out",
                "group-hover:opacity-100",
                i === 0 &&
                  "-ml-[36%] translate-x-[45%] translate-y-6 rotate-[-14deg] group-hover:translate-x-[-88%] group-hover:translate-y-1",
                i === 1 &&
                  "-ml-[32%] translate-x-0 translate-y-7 group-hover:translate-y-0",
                i === 2 &&
                  "-ml-[28%] translate-x-[-45%] translate-y-6 rotate-[14deg] group-hover:translate-x-[88%] group-hover:translate-y-1"
              )}
              style={{ transitionDelay: `${i * 45}ms` }}
            >
              {/* Faixa de cor do tipo de arquivo */}
              <div
                className="absolute inset-x-0 top-0 z-10 h-[3px]"
                style={{ backgroundColor: meta.accent }}
              />
              {/* Selo do tipo de arquivo */}
              <div
                className="absolute right-0 top-[3px] z-10 flex items-center justify-center rounded-bl-[5px] px-1 py-0.5"
                style={{ backgroundColor: `${meta.accent}26` }}
              >
                <TypeIcon className="h-2.5 w-2.5" style={{ color: meta.accent }} />
              </div>
              <MiniItemThumbnail item={item} />
            </div>
          );
        })}

        {/* Capa frontal — abre em duas metades inclinadas, igual ao ReactBits */}
        <div className="absolute inset-x-0 bottom-0 top-[9px] z-20">
          <div
            className="absolute inset-0 origin-bottom rounded-[12px] rounded-tl-[5px] border bg-[var(--surface)] transition-transform duration-300 ease-in-out group-hover:[transform:skew(15deg)_scaleY(0.6)]"
            style={{
              borderColor: `${folderColor}40`,
              boxShadow: `0 0 6px ${folderColor}1F, var(--shadow-sm)`,
            }}
          />
          <div
            className="absolute inset-0 origin-bottom rounded-[12px] rounded-tl-[5px] border bg-[var(--surface)] transition-transform duration-300 ease-in-out group-hover:[transform:skew(-15deg)_scaleY(0.6)]"
            style={{
              borderColor: `${folderColor}40`,
              boxShadow: `0 0 6px ${folderColor}1F, var(--shadow-sm)`,
            }}
          />
        </div>

        {/* Neon discreto intensificado no hover (dentro + fora) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 top-[9px] z-[25] rounded-[12px] rounded-tl-[5px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            boxShadow: `inset 0 0 14px ${folderColor}2E, 0 0 10px ${folderColor}33`,
            border: `1px solid ${folderColor}66`,
          }}
        />

        {/* Conteúdo (título + stats) — some suavemente quando a capa abre */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[9px] z-30 flex flex-col p-3 transition-opacity duration-200 group-hover:opacity-0">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex min-w-0 items-center gap-1.5">
              <FolderIcon
                className="size-3.5 shrink-0"
                style={{ color: folderColor }}
              />
              <h3 className="truncate text-[13px] font-semibold text-[var(--foreground)]">
                {folder.name}
              </h3>
            </div>
          </div>

          <div className="mt-auto space-y-1">
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
            <FolderStatRow
              icon={Clock}
              label="Atualizado"
              value={formatRelativeDate(folder.updatedAt)}
            />
          </div>
        </div>

        {/* Menu de opções (não some no hover) */}
        <div className="absolute right-1.5 top-[13px] z-40">
          <ItemDropdownMenu
            id={folder.id}
            kind="folder"
            onOpen={() => {
              setCurrentFolder(folder.id);
              router.push(`/vault/folder/${folder.id}`);
            }}
          />
        </div>

        {isNavigating && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-[12px] rounded-tl-[5px] bg-[var(--surface)]/70 backdrop-blur-[2px]">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--primary)]" />
          </div>
        )}
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
    <div className="flex items-center gap-1.5 text-[10px]">
      <Icon className="size-3 shrink-0 text-[var(--foreground-subtle)]" />
      <span className="shrink-0 text-[var(--foreground-subtle)]">{label}</span>
      <span className="mx-0.5 flex-1 border-b border-dotted border-[var(--border)]" />
      <span
        className="shrink-0 font-semibold text-[var(--foreground)]"
        suppressHydrationWarning
      >
        {value}
      </span>
    </div>
  );
}