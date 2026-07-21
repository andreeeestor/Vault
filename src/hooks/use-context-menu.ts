"use client";

import { useState } from "react";

interface ContextMenuState {
  x: number;
  y: number;
  targetId: string;
}

export function useContextMenu() {
  const [menu, setMenu] = useState<ContextMenuState | null>(null);

  const open = (event: React.MouseEvent, targetId: string) => {
    event.preventDefault();
    setMenu({ x: event.clientX, y: event.clientY, targetId });
  };

  const close = () => setMenu(null);

  return { menu, open, close };
}
