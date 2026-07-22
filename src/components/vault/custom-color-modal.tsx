"use client";

import { useState } from "react";
import { Palette } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { labelColorHex } from "@/lib/utils";

interface CustomColorModalProps {
  open: boolean;
  onClose: () => void;
  currentColor?: string;
  onConfirm: (color: string) => void;
}

export function CustomColorModal({
  open,
  onClose,
  currentColor = "#5227FF",
  onConfirm,
}: CustomColorModalProps) {
  const initialHex = currentColor.startsWith("#")
    ? currentColor
    : labelColorHex(currentColor);
  const [hex, setHex] = useState(initialHex);

  const handleConfirm = () => {
    let cleanHex = hex.trim();
    if (!cleanHex.startsWith("#")) {
      cleanHex = `#${cleanHex}`;
    }
    if (/^#([0-9A-F]{3}){1,2}$/i.test(cleanHex)) {
      onConfirm(cleanHex);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent showClose={false} className="p-0 overflow-hidden max-w-sm">
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
              <Palette className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1">
              <h2 className="text-heading text-base font-semibold text-[var(--foreground)]">
                Defina sua cor
              </h2>
              <p className="text-xs text-[var(--foreground-subtle)] mt-0.5">
                Escolha na roda de cores ou digite o código hexadecimal
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
            >
              ✕
            </button>
          </div>

          <div className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] shadow-sm cursor-pointer">
                <input
                  type="color"
                  value={hex.startsWith("#") ? hex : "#5227FF"}
                  onChange={(e) => setHex(e.target.value)}
                  className="absolute -inset-2 h-20 w-20 cursor-pointer border-0 p-0"
                />
              </div>

              <div className="flex-1">
                <label className="text-xs font-medium text-[var(--foreground-subtle)]">
                  Código Hexadecimal
                </label>
                <Input
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  placeholder="#5227FF"
                  className="mt-1 font-mono uppercase text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleConfirm}>
                Aplicar cor
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
