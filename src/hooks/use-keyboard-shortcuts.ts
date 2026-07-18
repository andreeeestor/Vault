"use client";

import { useEffect } from "react";

type ShortcutHandler = (event: KeyboardEvent) => void;

interface ShortcutMap {
  [combo: string]: ShortcutHandler;
}

function normalizeCombo(event: KeyboardEvent): string {
  const parts: string[] = [];
  if (event.metaKey || event.ctrlKey) parts.push("mod");
  if (event.shiftKey) parts.push("shift");
  parts.push(event.key.toLowerCase());
  return parts.join("+");
}

/**
 * Registra atalhos de teclado globais. Ex.: useKeyboardShortcuts({ "mod+a": selectAll, "escape": clearSelection })
 * Ignora eventos disparados dentro de <input>/<textarea> para não conflitar com digitação.
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap, deps: unknown[] = []) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (["INPUT", "TEXTAREA"].includes(target.tagName)) return;

      const combo = normalizeCombo(event);
      const handlerFn = shortcuts[combo];
      if (handlerFn) {
        event.preventDefault();
        handlerFn(event);
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
