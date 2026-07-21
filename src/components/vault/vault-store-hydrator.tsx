"use client";

import { useEffect } from "react";
import { useVaultStore } from "@/lib/vault-store";
import type { Folder, VaultItem } from "@/types";

export function VaultStoreHydrator({
  folders,
  items,
  user,
}: {
  folders: Folder[];
  items: VaultItem[];
  user: { name: string; email: string; image: string | null } | null;
}) {
  useEffect(() => {
    useVaultStore.setState({ folders, items, user });
  }, [folders, items, user]);

  return null;
}
