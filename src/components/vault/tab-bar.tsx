"use client";

import { useRef, useEffect } from "react";
import { X } from "lucide-react";
import { useVaultStore, type Tab } from "@/lib/vault-store";
import { ITEM_TYPE_META } from "@/lib/item-meta";
import { cn } from "@/lib/utils";

export function TabBar() {
  const openTabs = useVaultStore((s) => s.openTabs);
  const activeTabId = useVaultStore((s) => s.activeTabId);
  const closeTab = useVaultStore((s) => s.closeTab);
  const setActiveTab = useVaultStore((s) => s.setActiveTab);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll active tab into view
  useEffect(() => {
    if (!activeTabId || !scrollRef.current) return;
    const el = scrollRef.current.querySelector<HTMLElement>(`[data-tab-id="${activeTabId}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }, [activeTabId]);

  // Ctrl+W closes active tab
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "w") {
        const target = e.target as HTMLElement;
        if (["INPUT", "TEXTAREA"].includes(target.tagName)) return;
        if (!activeTabId) return;
        e.preventDefault();
        closeTab(activeTabId);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeTabId, closeTab]);

  if (openTabs.length === 0) return null;

  return (
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
          onActivate={() => setActiveTab(tab.id)}
          onClose={() => closeTab(tab.id)}
        />
      ))}
    </div>
  );
}

function TabItem({
  tab,
  isActive,
  onActivate,
  onClose,
}: {
  tab: Tab;
  isActive: boolean;
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
      {/* Active indicator — thin line on top */}
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

      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label={`Fechar ${tab.title}`}
        className={cn(
          "ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-sm transition-all",
          isActive
            ? "opacity-60 hover:bg-[var(--surface-hover)] hover:opacity-100"
            : "opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-[var(--surface-hover)]"
        )}
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}
