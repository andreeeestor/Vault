"use client";

import type { ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  ExternalLink,
  Pencil,
  FolderInput,
  Link as LinkIcon,
  Star,
  Archive,
  Trash2,
  FolderPlus,
} from "lucide-react";
import { useVaultStore } from "@/lib/vault-store";
import { toast } from "sonner";

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
  const createFolder = useVaultStore((s) => s.createFolder);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => toast("Abrindo…")}>
          <ExternalLink className="h-4 w-4" /> Abrir
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => toast("Renomear — edição inline")}>
          <Pencil className="h-4 w-4" /> Renomear
        </ContextMenuItem>

        {kind === "folder" && (
          <ContextMenuItem onSelect={() => createFolder("Nova subpasta", id)}>
            <FolderPlus className="h-4 w-4" /> Nova subpasta
          </ContextMenuItem>
        )}

        <ContextMenuItem onSelect={() => toast("Escolha a pasta de destino")}>
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
            softDelete([id]);
            toast.success("Movido para a lixeira");
          }}
        >
          <Trash2 className="h-4 w-4" /> Excluir
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
