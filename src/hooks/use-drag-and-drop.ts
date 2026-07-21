"use client";

import { useVaultStore } from "@/lib/vault-store";

export function useDragAndDrop() {
  const drag = useVaultStore((s) => s.drag);
  const startDrag = useVaultStore((s) => s.startDrag);
  const setDropTarget = useVaultStore((s) => s.setDropTarget);
  const endDrag = useVaultStore((s) => s.endDrag);
  const moveEntities = useVaultStore((s) => s.moveEntities);

  return { drag, startDrag, setDropTarget, endDrag, moveEntities };
}
