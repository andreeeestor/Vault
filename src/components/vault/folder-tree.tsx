"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Star, Archive, KeyRound, FileClock, Plus } from "lucide-react";
import { FolderTreeItem } from "./folder-tree-item";
import { getChildFolders, useVaultStore } from "@/lib/vault-store";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { SidebarSkeleton } from "@/components/ui/skeleton";
import type { Folder } from "@/types";

const SHORTCUTS = [
  { href: "/vault/favorites", label: "Favoritos", icon: Star },
  { href: "/vault/passwords", label: "Senhas", icon: KeyRound },
  { href: "/vault/archived", label: "Arquivados", icon: Archive },
  { href: "/vault/trash", label: "Lixeira", icon: FileClock },
];

export function FolderTree() {
  const router = useRouter();
  const folders = useVaultStore((s) => s.folders);
  const createFolder = useVaultStore((s) => s.createFolder);
  const setCurrentFolder = useVaultStore((s) => s.setCurrentFolder);
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState("");

  const rootFolder = folders.find((f) => f.isRoot);

  const handleNavigate = (id: string) => {
    setCurrentFolder(id);
    router.push(
      rootFolder && id === rootFolder.id ? "/vault" : `/vault/folder/${id}`,
    );
  };

  const commitNewFolder = () => {
    const name = draftName.trim();
    if (name && rootFolder) createFolder(name, rootFolder.id);
    setDraftName("");
    setCreating(false);
  };

  const onDraftKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitNewFolder();
    if (e.key === "Escape") {
      setDraftName("");
      setCreating(false);
    }
  };

  if (!rootFolder) {
    return <SidebarSkeleton />;
  }

  const rootChildren = getChildFolders(folders, rootFolder.id);

  return (
    <div className="flex flex-col gap-1">
      <ShortcutsSection router={router} />

      <div className="mx-2 my-2 h-px bg-border" />

      <FoldersSection
        rootFolder={rootFolder}
        rootChildren={rootChildren}
        creating={creating}
        draftName={draftName}
        onNavigate={handleNavigate}
        onStartCreating={() => setCreating(true)}
        onDraftChange={(v) => setDraftName(v)}
        onDraftKeyDown={onDraftKeyDown}
        onCommit={commitNewFolder}
      />
    </div>
  );
}

function ShortcutsSection({ router }: { router: ReturnType<typeof useRouter> }) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <SectionHeader label="Atalhos" open={open} onToggle={() => setOpen((v) => !v)} showAdd={false} />
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col gap-0.5 px-2 pt-0.5">
          {SHORTCUTS.map(({ href, label, icon: Icon }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={cn(
                "flex h-8 items-center gap-2.5 rounded-sm px-2 text-sm text-foreground-muted transition-colors hover:bg-surface-hover",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

function FoldersSection({
  rootFolder,
  rootChildren,
  creating,
  draftName,
  onNavigate,
  onStartCreating,
  onDraftChange,
  onDraftKeyDown,
  onCommit,
}: {
  rootFolder: Folder;
  rootChildren: Folder[];
  creating: boolean;
  draftName: string;
  onNavigate: (id: string) => void;
  onStartCreating: () => void;
  onDraftChange: (v: string) => void;
  onDraftKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onCommit: () => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <SectionHeader
        label="Pastas"
        open={open}
        onToggle={() => setOpen((v) => !v)}
        showAdd
        onAdd={onStartCreating}
      />
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          open ? "max-h-[9999px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="mt-1 flex flex-col gap-0.5 px-1" role="tree">
          <FolderTreeItem
            folder={rootFolder}
            depth={0}
            onNavigate={onNavigate}
          />

          {rootChildren.length === 0 && !creating && (
            <p className="px-3 py-2 text-xs text-foreground-subtle">
              Nenhuma subpasta ainda.
            </p>
          )}

          {creating && (
            <div className="px-2 pl-6">
              <Input
                autoFocus
                value={draftName}
                placeholder="Nome da pasta"
                onChange={(e) => onDraftChange(e.target.value)}
                onKeyDown={onDraftKeyDown}
                onBlur={onCommit}
                className="h-7 text-xs"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  label,
  open,
  onToggle,
  showAdd,
  onAdd,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  showAdd: boolean;
  onAdd?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-2">
      <button
        onClick={onToggle}
        className="flex flex-1 items-center gap-1 rounded-sm py-0.5 text-xs font-medium uppercase tracking-wide text-foreground-subtle hover:text-foreground transition-colors"
      >
        <svg
          className={cn("h-3 w-3 shrink-0 transition-transform duration-200", open ? "rotate-0" : "-rotate-90")}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="2,4 6,8 10,4" />
        </svg>
        {label}
      </button>
      {showAdd && (
        <button
          aria-label="Nova pasta"
          onClick={onAdd}
          className="flex h-5 w-5 items-center justify-center rounded-md text-foreground-subtle hover:bg-surface-hover hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
