"use client";

import type { ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  ExternalLink,
  Pencil,
  FolderInput,
  Link as LinkIcon,
  Star,
  Archive,
  Trash2,
  FolderPlus,
  Palette,
  MoreVertical,
} from "lucide-react";
import { useVaultStore } from "@/lib/vault-store";
import { toast } from "sonner";
import { labelColorHex } from "@/lib/utils";
import type { LabelColor } from "@/types";

const FOLDER_COLORS: { id: LabelColor; label: string }[] = [
  { id: "violet", label: "Violeta" },
  { id: "rose", label: "Rosa" },
  { id: "amber", label: "Âmbar" },
  { id: "emerald", label: "Esmeralda" },
  { id: "sky", label: "Azul Céu" },
  { id: "stone", label: "Pedra" },
];

export function ItemContextMenu({
  id,
  kind,
  isFavorite,
  children,
}: {
  id: string;
  kind: "item" | "folder";
  isFavorite?: boolean;
  children: ReactNode;
}) {
  const toggleFavorite = useVaultStore((s) => s.toggleFavorite);
  const toggleArchive = useVaultStore((s) => s.toggleArchive);
  const softDelete = useVaultStore((s) => s.softDelete);
  const deleteFolder = useVaultStore((s) => s.deleteFolder);
  const updateFolderColor = useVaultStore((s) => s.updateFolderColor);
  const createFolder = useVaultStore((s) => s.createFolder);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onSelect={() => {
            toast.success("Item aberto!");
          }}
        >
          <ExternalLink className="h-4 w-4" /> Abrir
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => {
            const name = window.prompt("Digite o novo nome:");
            if (name?.trim()) {
              useVaultStore.getState().renameEntity(id, name.trim(), kind);
              toast.success("Renomeado com sucesso!");
            }
          }}
        >
          <Pencil className="h-4 w-4" /> Renomear
        </ContextMenuItem>

        {kind === "folder" && (
          <>
            <ContextMenuItem
              onSelect={() => {
                const name = window.prompt("Nome da subpasta:");
                if (name?.trim()) {
                  createFolder(name.trim(), id);
                  toast.success("Subpasta criada!");
                }
              }}
            >
              <FolderPlus className="h-4 w-4" /> Nova subpasta
            </ContextMenuItem>

            {/* Marcador de cor da pasta */}
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span>Cor da pasta</span>
                </div>
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                {FOLDER_COLORS.map((c) => (
                  <ContextMenuItem
                    key={c.id}
                    onSelect={() => {
                      updateFolderColor(id, c.id);
                      toast.success(`Cor da pasta alterada para ${c.label}`);
                    }}
                  >
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: labelColorHex(c.id) }}
                    />
                    <span>{c.label}</span>
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          </>
        )}

        <ContextMenuItem onSelect={() => toast("Mover funcionalidade em breve!")}>
          <FolderInput className="h-4 w-4" /> Mover para…
        </ContextMenuItem>

        {kind === "item" && (
          <>
            <ContextMenuItem
              onSelect={() => {
                navigator.clipboard?.writeText(`${window.location.origin}/vault/item/${id}`);
                toast.success("Link copiado");
              }}
            >
              <LinkIcon className="h-4 w-4" /> Copiar link
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => toggleFavorite(id)}>
              <Star className="h-4 w-4" /> {isFavorite ? "Remover dos favoritos" : "Favoritar"}
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => toggleArchive(id)}>
              <Archive className="h-4 w-4" /> Arquivar
            </ContextMenuItem>
          </>
        )}

        <ContextMenuSeparator />

        <ContextMenuItem
          destructive
          onSelect={() => {
            if (kind === "folder") {
              deleteFolder(id);
              toast.success("Pasta excluída com sucesso");
            } else {
              softDelete([id]);
              toast.success("Movido para a lixeira");
            }
          }}
        >
          <Trash2 className="h-4 w-4" /> Excluir
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function ItemDropdownMenu({
  id,
  kind,
  isFavorite,
  onOpen,
}: {
  id: string;
  kind: "item" | "folder";
  isFavorite?: boolean;
  onOpen?: () => void;
}) {
  const toggleFavorite = useVaultStore((s) => s.toggleFavorite);
  const toggleArchive = useVaultStore((s) => s.toggleArchive);
  const softDelete = useVaultStore((s) => s.softDelete);
  const deleteFolder = useVaultStore((s) => s.deleteFolder);
  const updateFolderColor = useVaultStore((s) => s.updateFolderColor);
  const createFolder = useVaultStore((s) => s.createFolder);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()} // impede clique no card/linha
          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[var(--surface-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors outline-none"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[170px]">
        <DropdownMenuItem
          onSelect={(e) => {
            e.stopPropagation();
            if (onOpen) onOpen();
          }}
        >
          <ExternalLink className="h-4 w-4" /> Abrir
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onSelect={(e) => {
            e.stopPropagation();
            const name = window.prompt("Digite o novo nome:");
            if (name?.trim()) {
              useVaultStore.getState().renameEntity(id, name.trim(), kind);
              toast.success("Renomeado com sucesso!");
            }
          }}
        >
          <Pencil className="h-4 w-4" /> Renomear
        </DropdownMenuItem>

        {kind === "folder" && (
          <>
            <DropdownMenuItem
              onSelect={(e) => {
                e.stopPropagation();
                const name = window.prompt("Nome da subpasta:");
                if (name?.trim()) {
                  createFolder(name.trim(), id);
                  toast.success("Subpasta criada!");
                }
              }}
            >
              <FolderPlus className="h-4 w-4" /> Nova subpasta
            </DropdownMenuItem>

            {/* Marcador de cor da pasta */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span>Cor da pasta</span>
                </div>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {FOLDER_COLORS.map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onSelect={(e) => {
                      e.stopPropagation();
                      updateFolderColor(id, c.id);
                      toast.success(`Cor da pasta alterada para ${c.label}`);
                    }}
                  >
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: labelColorHex(c.id) }}
                    />
                    <span>{c.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}

        <DropdownMenuItem
          onSelect={(e) => {
            e.stopPropagation();
            toast("Mover funcionalidade em breve!");
          }}
        >
          <FolderInput className="h-4 w-4" /> Mover para…
        </DropdownMenuItem>

        {kind === "item" && (
          <>
            <DropdownMenuItem
              onSelect={(e) => {
                e.stopPropagation();
                navigator.clipboard?.writeText(`${window.location.origin}/vault/item/${id}`);
                toast.success("Link copiado");
              }}
            >
              <LinkIcon className="h-4 w-4" /> Copiar link
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.stopPropagation();
                toggleFavorite(id);
              }}
            >
              <Star className="h-4 w-4" /> {isFavorite ? "Remover dos favoritos" : "Favoritar"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.stopPropagation();
                toggleArchive(id);
              }}
            >
              <Archive className="h-4 w-4" /> Arquivar
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          destructive
          onSelect={(e) => {
            e.stopPropagation();
            if (kind === "folder") {
              deleteFolder(id);
              toast.success("Pasta excluída com sucesso");
            } else {
              softDelete([id]);
              toast.success("Movido para a lixeira");
            }
          }}
        >
          <Trash2 className="h-4 w-4" /> Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
