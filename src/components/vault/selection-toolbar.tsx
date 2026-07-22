"use client";

import { AnimatePresence, motion } from "motion/react";
import { Archive, FolderInput, Star, Tag, Trash2, X } from "lucide-react";
import { useVaultStore } from "@/lib/vault-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SelectionToolbar() {
  const selectedIds = useVaultStore((s) => s.selectedIds);
  const clearSelection = useVaultStore((s) => s.clearSelection);
  const softDelete = useVaultStore((s) => s.softDelete);
  const toggleArchive = useVaultStore((s) => s.toggleArchive);
  const toggleFavorite = useVaultStore((s) => s.toggleFavorite);

  const count = selectedIds.size;
  const ids = Array.from(selectedIds);

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: "spring", bounce: 0, duration: 0.35 }}
          className="glass fixed bottom-4 sm:bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 max-w-[calc(100vw-1.5rem)] overflow-x-auto whitespace-nowrap scrollbar-none rounded-[var(--radius-lg)] border border-[var(--border)] px-2 py-2 shadow-[var(--shadow-lg)]"
        >
          <button
            onClick={clearSelection}
            className="flex h-8 items-center gap-1.5 shrink-0 rounded-[var(--radius-sm)] px-2.5 text-xs sm:text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
          >
            <X className="h-3.5 w-3.5" />
            <span>{count}</span> <span className="hidden sm:inline">selecionado{count > 1 ? "s" : ""}</span>
          </button>

          <div className="mx-1 h-5 w-px shrink-0 bg-[var(--border-strong)]" />

          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-xs sm:text-sm px-2 sm:px-3"
            onClick={() => {
              ids.forEach(toggleFavorite);
              toast.success("Adicionado aos favoritos");
            }}
          >
            <Star className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Favoritar</span>
          </Button>
          <Button variant="ghost" size="sm" className="shrink-0 text-xs sm:text-sm px-2 sm:px-3" onClick={() => toast("Selecione a pasta de destino")}>
            <FolderInput className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Mover</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-xs sm:text-sm px-2 sm:px-3"
            onClick={() => {
              ids.forEach(toggleArchive);
              toast.success("Itens arquivados");
              clearSelection();
            }}
          >
            <Archive className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Arquivar</span>
          </Button>
          <Button variant="ghost" size="sm" className="shrink-0 text-xs sm:text-sm px-2 sm:px-3" onClick={() => toast("Editor de tags em lote")}>
            <Tag className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Tags</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              softDelete(ids);
              toast.success("Itens movidos para a lixeira", {
                action: { label: "Desfazer", onClick: () => undefined },
              });
            }}
            className="shrink-0 text-xs sm:text-sm px-2 sm:px-3 text-[var(--danger)] hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Excluir</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
