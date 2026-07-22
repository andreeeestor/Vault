"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Eye, Info, FileQuestion } from "lucide-react";
import { useVaultStore } from "@/lib/vault-store";
import { ItemViewer } from "@/components/vault/item-viewer";
import { ItemDetailSidebar } from "@/components/vault/item-detail-sidebar";
import { EmptyState } from "@/components/vault/empty-state";
import { cn } from "@/lib/utils";

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams<{ itemId: string }>();
  const items = useVaultStore((s) => s.items);
  const item = items.find((i) => i.id === params.itemId);

  const [activeMobileTab, setActiveMobileTab] = useState<"viewer" | "details">("viewer");

  if (!item) {
    return (
      <div className="flex flex-1 flex-col">
        <EmptyState
          icon={FileQuestion}
          title="Item não encontrado"
          description="Ele pode ter sido movido ou excluído."
          action={
            <button onClick={() => router.push("/vault")} className="text-sm font-medium text-primary">
              Voltar ao Vault
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col overflow-y-auto lg:h-screen lg:flex-row lg:overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Voltar"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-foreground-muted transition-colors hover:bg-[var(--surface-hover)]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="truncate text-sm font-medium text-[var(--foreground)]">{item.title}</h1>
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-[var(--surface-hover)] p-1 lg:hidden">
            <button
              onClick={() => setActiveMobileTab("viewer")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                activeMobileTab === "viewer"
                  ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs"
                  : "text-[var(--foreground-muted)]"
              )}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Ver</span>
            </button>
            <button
              onClick={() => setActiveMobileTab("details")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                activeMobileTab === "details"
                  ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs"
                  : "text-[var(--foreground-muted)]"
              )}
            >
              <Info className="h-3.5 w-3.5" />
              <span>Detalhes</span>
            </button>
          </div>
        </div>

        <div
          className={cn(
            "flex-1 overflow-hidden",
            activeMobileTab === "details" ? "hidden lg:block" : "block"
          )}
        >
          <ItemViewer item={item} />
        </div>
      </div>

      <div
        className={cn(
          "lg:block",
          activeMobileTab === "viewer" ? "hidden lg:block" : "block"
        )}
      >
        <ItemDetailSidebar item={item} />
      </div>
    </div>
  );
}
