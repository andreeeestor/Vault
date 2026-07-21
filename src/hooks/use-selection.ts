"use client";

import { useVaultStore } from "@/lib/vault-store";

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
