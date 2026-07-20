"use client";

import { Star, Archive, Trash2, FolderInput, Share2, Pencil, Save } from "lucide-react";
import type { VaultItem } from "@/types";
import { ITEM_TYPE_META } from "@/lib/item-meta";
import { formatBytes, formatRelativeDate, labelColorHex } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useVaultStore } from "@/lib/vault-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ItemDetailSidebar({ item }: { item: VaultItem }) {
  const router = useRouter();
  const toggleFavorite = useVaultStore((s) => s.toggleFavorite);
  const toggleArchive = useVaultStore((s) => s.toggleArchive);
  const softDelete = useVaultStore((s) => s.softDelete);
  const folders = useVaultStore((s) => s.folders);
  const meta = ITEM_TYPE_META[item.type];
  const folder = folders.find((f) => f.id === item.folderId);

  // Somente exibe botão Salvar para tipos editáveis (NOTE, SNIPPET)
  const isEditable = item.type === "NOTE" || item.type === "SNIPPET";

  return (
    <aside className="flex w-[300px] shrink-0 flex-col gap-6 border-l border-[var(--border)] bg-[var(--background-elevated)] p-5">
      <div>
        <h2 className="text-heading text-base font-semibold text-[var(--foreground)]">Detalhes</h2>
      </div>

      <dl className="flex flex-col gap-3 text-sm">
        <Row label="Tipo" value={meta.label} />
        <Row label="Pasta" value={folder?.name ?? "Meu Vault"} />
        {item.fileSize !== null && <Row label="Tamanho" value={formatBytes(item.fileSize)} />}
        {item.mimeType && <Row label="Formato" value={item.mimeType} />}
        <Row label="Criado em" value={formatRelativeDate(item.createdAt)} />
        <Row label="Modificado em" value={formatRelativeDate(item.updatedAt)} />
      </dl>

      <div>
        <span className="text-xs font-medium text-[var(--foreground-subtle)]">Etiqueta</span>
        <div className="mt-1.5 flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: labelColorHex(item.color) }}
          />
          <span className="text-sm text-[var(--foreground)] capitalize">{item.color}</span>
        </div>
      </div>

      {item.tags.length > 0 && (
        <div>
          <span className="text-xs font-medium text-[var(--foreground-subtle)]">Tags</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2">
        {isEditable && (
          <Button
            onClick={() => {
              document.dispatchEvent(new CustomEvent("vault-save-item"));
            }}
            className="bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
          >
            <Save className="h-4 w-4" /> Salvar alterações
          </Button>
        )}
        <Button variant="secondary" onClick={() => toggleFavorite(item.id)}>
          <Star className="h-4 w-4" fill={item.isFavorite ? "currentColor" : "none"} />
          {item.isFavorite ? "Remover dos favoritos" : "Favoritar"}
        </Button>
        <Button variant="secondary" onClick={() => toast("Selecione a pasta de destino")}>
          <FolderInput className="h-4 w-4" /> Mover
        </Button>
        <Button variant="secondary" onClick={() => toast("Link de compartilhamento copiado")}>
          <Share2 className="h-4 w-4" /> Compartilhar
        </Button>
        <Button variant="secondary" onClick={() => toggleArchive(item.id)}>
          <Archive className="h-4 w-4" /> {item.isArchived ? "Desarquivar" : "Arquivar"}
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            softDelete([item.id]);
            toast.success("Movido para a lixeira");
          }}
        >
          <Trash2 className="h-4 w-4" /> Excluir
        </Button>
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[var(--foreground-subtle)]">{label}</dt>
      <dd className="font-medium text-[var(--foreground)]">{value}</dd>
    </div>
  );
}
