"use client";

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useVaultStore } from "@/lib/vault-store";
import { ItemViewer } from "@/components/vault/item-viewer";
import { ItemDetailSidebar } from "@/components/vault/item-detail-sidebar";
import { EmptyState } from "@/components/vault/empty-state";
import { FileQuestion } from "lucide-react";

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams<{ itemId: string }>();
  const items = useVaultStore((s) => s.items);
  const item = items.find((i) => i.id === params.itemId);

  if (!item) {
    return (
      <div className="flex flex-1 flex-col">
        <EmptyState
          icon={FileQuestion}
          title="Item não encontrado"
          description="Ele pode ter sido movido ou excluído."
          action={
            <button onClick={() => router.push("/vault")} className="text-sm font-medium text-[var(--primary)]">
              Voltar ao Vault
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-1">
      <div className="flex flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--border)] px-4">
          <button
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="truncate text-sm font-medium text-[var(--foreground)]">{item.title}</h1>
        </div>
        <div className="flex-1 overflow-hidden">
          <ItemViewer item={item} />
        </div>
      </div>
      <ItemDetailSidebar item={item} />
    </div>
  );
}
