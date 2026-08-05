"use client";

import { useRef, useEffect, useState } from "react";
import { X, Circle } from "lucide-react";
import { useVaultStore, type Tab } from "@/lib/vault-store";
import { ITEM_TYPE_META } from "@/lib/item-meta";
import { UnsavedChangesModal } from "./unsaved-changes-modal";
import { cn } from "@/lib/utils";

export function TabBar() {
  const openTabs = useVaultStore((s) => s.openTabs);
  const activeTabId = useVaultStore((s) => s.activeTabId);
  const dirtyTabIds = useVaultStore((s) => s.dirtyTabIds);
  const closeTab = useVaultStore((s) => s.closeTab);
  const setActiveTab = useVaultStore((s) => s.setActiveTab);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Pending close confirmation
  const [pendingCloseId, setPendingCloseId] = useState<string | null>(null);

  // Scroll active tab into view
  useEffect(() => {
    if (!activeTabId || !scrollRef.current) return;
    const el = scrollRef.current.querySelector<HTMLElement>(`[data-tab-id="${activeTabId}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }, [activeTabId]);

  // Ctrl+W / Cmd+W closes active tab (with dirty guard)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key !== "w") return;
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (!activeTabId) return;
      e.preventDefault();
      requestClose(activeTabId);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabId, dirtyTabIds]);

  const requestClose = (id: string) => {
    if (dirtyTabIds.has(id)) {
      setPendingCloseId(id);
    } else {
      closeTab(id);
    }
  };

  const confirmClose = () => {
    if (pendingCloseId) {
      closeTab(pendingCloseId);
      setPendingCloseId(null);
    }
  };

  if (openTabs.length === 0) return null;

  return (
    <>
      <div
        ref={scrollRef}
        className="flex h-9 shrink-0 items-stretch overflow-x-auto border-b border-[var(--border)] bg-[var(--background-elevated)]"
        style={{ scrollbarWidth: "none" }}
      >
        {openTabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            isDirty={dirtyTabIds.has(tab.id)}
            onActivate={() => setActiveTab(tab.id)}
            onClose={() => requestClose(tab.id)}
          />
        ))}
      </div>

      <UnsavedChangesModal
        open={pendingCloseId !== null}
        onClose={() => setPendingCloseId(null)}
        onConfirm={confirmClose}
      />
    </>
  );
}

function TabItem({
  tab,
  isActive,
  isDirty,
  onActivate,
  onClose,
}: {
  tab: Tab;
  isActive: boolean;
  isDirty: boolean;
  onActivate: () => void;
  onClose: () => void;
}) {
  const meta = ITEM_TYPE_META[tab.type];
  const Icon = meta.icon;

  return (
    <div
      data-tab-id={tab.id}
      onClick={onActivate}
      className={cn(
        "group relative flex shrink-0 cursor-pointer select-none items-center gap-1.5 border-r border-[var(--border)] px-3 transition-colors",
        "max-w-[180px] min-w-[100px]",
        isActive
          ? "bg-[var(--surface)] text-[var(--foreground)]"
          : "text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
      )}
    >
      {/* Active indicator — colored top line */}
      {isActive && (
        <span
          className="absolute inset-x-0 top-0 h-[2px] rounded-b-sm"
          style={{ background: meta.accent }}
        />
      )}

      <Icon
        className="h-3.5 w-3.5 shrink-0"
        style={{ color: isActive ? meta.accent : "currentColor" }}
      />

      <span className="truncate text-xs font-medium">{tab.title}</span>

      {/* Dirty dot / close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label={`Fechar ${tab.title}`}
        className={cn(
          "ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-sm transition-all",
          isActive
            ? "opacity-70 hover:bg-[var(--surface-hover)] hover:opacity-100"
            : "opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-[var(--surface-hover)]"
        )}
      >
        {isDirty && !isActive ? (
          // Show dirty dot when tab is not active and not hovered
          <span className="relative flex h-4 w-4 items-center justify-center">
            <Circle className="absolute h-2 w-2 fill-amber-400 text-amber-400 group-hover:hidden" />
            <X className="absolute hidden h-2.5 w-2.5 group-hover:block" />
          </span>
        ) : isDirty ? (
          // Active + dirty: show amber dot that turns to X on button hover
          <span className="relative flex h-4 w-4 items-center justify-center">
            <X className="h-2.5 w-2.5" />
          </span>
        ) : (
          <X className="h-2.5 w-2.5" />
        )}
      </button>

      {/* Amber dot indicator for unsaved changes (on inactive tabs) */}
      {isDirty && !isActive && (
        <span className="absolute right-2 top-1 h-1.5 w-1.5 rounded-full bg-amber-400 group-hover:hidden" />
      )}
    </div>
  );
}
