"use client";

import { useEffect } from "react";
import { useVaultStore } from "@/lib/vault-store";
import type { Folder, VaultItem } from "@/types";

/**
 * Hidrata o Zustand store com dados reais vindos do Server Component.
 * Renderiza null — é apenas lógica, sem UI.
 */
export function VaultStoreHydrator({
  folders,
  items,
}: {
  folders: Folder[];
  items: VaultItem[];
}) {
  useEffect(() => {
    useVaultStore.setState({ folders, items });
  }, [folders, items]);

  return null;
}
