"use client";

import { useState } from "react";
import { Palette, Check } from "lucide-react";
import { LABEL_COLORS, labelColorHex } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface FolderColorPickerProps {
  selectedColor?: string;
  onSelectColor: (color: string) => void;
  className?: string;
}

export function FolderColorPicker({
  selectedColor = "violet",
  onSelectColor,
  className,
}: FolderColorPickerProps) {
  const [showCustomPopover, setShowCustomPopover] = useState(false);
  const [customHex, setCustomHex] = useState(
    selectedColor.startsWith("#") ? selectedColor : labelColorHex(selectedColor)
  );

  const isCustomColor =
    selectedColor.startsWith("#") &&
    !LABEL_COLORS.some((c) => c.hex.toLowerCase() === selectedColor.toLowerCase());

  const handleApplyCustomHex = (hex: string) => {
    let cleanHex = hex.trim();
    if (!cleanHex.startsWith("#")) {
      cleanHex = `#${cleanHex}`;
    }
    if (/^#([0-9A-F]{3}){1,2}$/i.test(cleanHex)) {
      onSelectColor(cleanHex);
      setCustomHex(cleanHex);
    }
  };

  return (
    <div
      className={cn("flex flex-col gap-2.5", className)}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="grid grid-cols-6 gap-2">
        {LABEL_COLORS.map((c) => {
          const isSelected = selectedColor === c.id || selectedColor === c.hex;
          return (
            <button
              key={c.id}
              type="button"
              title={c.name}
              onClick={() => {
                onSelectColor(c.id);
                setShowCustomPopover(false);
              }}
              className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110 focus:outline-none",
                isSelected && "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--background)]"
              )}
              style={{ backgroundColor: c.hex }}
            >
              {isSelected && <Check className="h-4 w-4 text-white drop-shadow-sm" />}
            </button>
          );
        })}
      </div>

      <div className="relative pt-1">
        <button
          type="button"
          onClick={() => setShowCustomPopover((prev) => !prev)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]",
            (isCustomColor || showCustomPopover) && "border-[var(--primary)] text-[var(--primary)]"
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className="h-4 w-4 rounded-full border border-black/20 dark:border-white/20 shadow-xs shrink-0"
              style={{ backgroundColor: labelColorHex(selectedColor) }}
            />
            <span>Defina sua cor</span>
          </div>
          <Palette className="h-3.5 w-3.5 opacity-70" />
        </button>

        {showCustomPopover && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xl backdrop-blur-md animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <span className="text-xs font-semibold text-[var(--foreground)]">Escolher cor personalizada</span>
              <button
                type="button"
                onClick={() => setShowCustomPopover(false)}
                className="text-xs text-[var(--foreground-subtle)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] cursor-pointer">
                <input
                  type="color"
                  value={customHex.startsWith("#") ? customHex : labelColorHex(customHex)}
                  onChange={(e) => {
                    const newHex = e.target.value;
                    setCustomHex(newHex);
                    onSelectColor(newHex);
                  }}
                  className="absolute -inset-2 h-14 w-14 cursor-pointer border-0 p-0"
                />
              </div>

              <div className="flex-1">
                <label className="text-[10px] font-medium text-[var(--foreground-subtle)]">Código Hexadecimal</label>
                <Input
                  value={customHex}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomHex(val);
                    handleApplyCustomHex(val);
                  }}
                  placeholder="#5227FF"
                  className="h-8 text-xs font-mono uppercase mt-0.5"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                handleApplyCustomHex(customHex);
                setShowCustomPopover(false);
              }}
              className="w-full rounded-md bg-[var(--primary)] py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              Confirmar cor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
