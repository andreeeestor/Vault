"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, Star, Archive, KeyRound, FileClock } from "lucide-react";
import { useVaultStore } from "@/lib/vault-store";
import { ITEM_TYPE_META } from "@/lib/item-meta";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const items = useVaultStore((s) => s.items);
  const folders = useVaultStore((s) => s.folders);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 pt-[15vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <Command
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]"
        shouldFilter
      >
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-4">
          <Search className="h-4 w-4 text-[var(--foreground-subtle)]" />
          <Command.Input
            autoFocus
            placeholder="Buscar em todo o Vault…"
            className="h-12 flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-subtle)]"
          />
          <kbd className="rounded border border-[var(--border-strong)] px-1.5 py-0.5 text-[10px] text-[var(--foreground-subtle)]">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="py-8 text-center text-sm text-[var(--foreground-subtle)]">
            Nenhum resultado encontrado.
          </Command.Empty>

          <Command.Group heading="Atalhos" className="text-xs text-[var(--foreground-subtle)]">
            {[
              { label: "Favoritos", href: "/vault/favorites", icon: Star },
              { label: "Senhas", href: "/vault/passwords", icon: KeyRound },
              { label: "Arquivados", href: "/vault/archived", icon: Archive },
              { label: "Lixeira", href: "/vault/trash", icon: FileClock },
            ].map(({ label, href, icon: Icon }) => (
              <Command.Item
                key={href}
                onSelect={() => {
                  router.push(href);
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm text-[var(--foreground)] data-[selected=true]:bg-[var(--surface-hover)]"
              >
                <Icon className="h-4 w-4" /> {label}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Pastas" className="text-xs text-[var(--foreground-subtle)]">
            {folders
              .filter((f) => !f.isRoot)
              .map((folder) => (
                <Command.Item
                  key={folder.id}
                  value={folder.name}
                  onSelect={() => {
                    router.push(`/vault/folder/${folder.id}`);
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm text-[var(--foreground)] data-[selected=true]:bg-[var(--surface-hover)]"
                >
                  {folder.name}
                </Command.Item>
              ))}
          </Command.Group>

          <Command.Group heading="Itens" className="text-xs text-[var(--foreground-subtle)]">
            {items
              .filter((i) => !i.isDeleted)
              .map((item) => {
                const Icon = ITEM_TYPE_META[item.type].icon;
                return (
                  <Command.Item
                    key={item.id}
                    value={item.title}
                    onSelect={() => {
                      router.push(`/vault/item/${item.id}`);
                      setOpen(false);
                    }}
                    className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm text-[var(--foreground)] data-[selected=true]:bg-[var(--surface-hover)]"
                  >
                    <Icon className="h-4 w-4" style={{ color: ITEM_TYPE_META[item.type].accent }} />
                    {item.title}
                  </Command.Item>
                );
              })}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
