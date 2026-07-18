"use client";

import { useVaultStore } from "@/lib/vault-store";

/**
 * Fachada sobre o store do Vault para a lógica de seleção múltipla
 * (shift+click intervalo, ctrl/cmd+click individual, ctrl/cmd+A todos).
 */
export function useSelection() {
  const selectedIds = useVaultStore((s) => s.selectedIds);
  const selectOnly = useVaultStore((s) => s.selectOnly);
  const toggleSelect = useVaultStore((s) => s.toggleSelect);
  const selectRange = useVaultStore((s) => s.selectRange);
  const selectAll = useVaultStore((s) => s.selectAll);
  const clearSelection = useVaultStore((s) => s.clearSelection);

  return {
    selectedIds,
    count: selectedIds.size,
    selectOnly,
    toggleSelect,
    selectRange,
    selectAll,
    clearSelection,
  };
}
