"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface UnsavedChangesModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function UnsavedChangesModal({ open, onClose, onConfirm }: UnsavedChangesModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent showClose={false} className="max-w-sm p-5 gap-0">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--foreground)]">
              Alterações não salvas!
            </h3>
            <p className="text-xs text-[var(--foreground-muted)] mt-1.5 leading-relaxed">
              Você tem modificações não salvas no arquivo. Se você sair agora, todo o conteúdo não salvo será permanentemente perdido.
            </p>
          </div>
          <div className="flex w-full gap-2 mt-2">
            <Button variant="secondary" className="flex-1 text-xs" onClick={onClose}>
              Voltar ao editor
            </Button>
            <Button variant="danger" className="flex-1 text-xs" onClick={onConfirm}>
              Sair sem salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
