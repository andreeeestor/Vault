"use client";

import { useEffect, useRef, useState } from "react";

export type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Salva automaticamente `value` após `delayMs` de inatividade.
 * Usado pelo editor de notas (auto-save com debounce de 1.5s).
 */
export function useAutoSave(
  value: string,
  onSave: (value: string) => Promise<void>,
  delayMs = 1500
): AutoSaveStatus {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(value);

  useEffect(() => {
    if (value === lastSavedRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setStatus("saving");
      try {
        await onSave(value);
        lastSavedRef.current = value;
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delayMs]);

  return status;
}
