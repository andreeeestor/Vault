"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { BreadcrumbItem, Breadcrumb } from "@/components/ui/breadcrumb";
import { ItemGrid } from "./item-grid";
import { ItemList } from "./item-list";
import { SelectionToolbar } from "./selection-toolbar";
import { useVaultStore } from "@/lib/vault-store";
import type { VaultItem } from "@/types";
import type { LucideIcon } from "lucide-react";
import { EmptyState } from "./empty-state";

export function FilteredItemsView({
  title,
  icon,
  emptyDescription,
  filter,
}: {
  title: string;
  icon: LucideIcon;
  emptyDescription: string;
  filter: (item: VaultItem) => boolean;
}) {
  const items = useVaultStore((s) => s.items);
  const viewMode = useVaultStore((s) => s.viewMode);
  const filtered = items.filter(filter);

  return (
    <>
      <DashboardHeader
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbItem active>{title}</BreadcrumbItem>
          </Breadcrumb>
        }
      />
      <main className="flex-1 p-6">
        {filtered.length === 0 ? (
          <EmptyState icon={icon} title={`Nada em "${title}" por aqui`} description={emptyDescription} />
        ) : viewMode === "grid" ? (
          <ItemGrid folders={[]} items={filtered} />
        ) : (
          <ItemList folders={[]} items={filtered} />
        )}
      </main>
      <SelectionToolbar />
    </>
  );
}
