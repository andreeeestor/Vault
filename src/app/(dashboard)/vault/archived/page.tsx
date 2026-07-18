"use client";

import { Archive } from "lucide-react";
import { FilteredItemsView } from "@/components/vault/filtered-items-view";

export default function ArchivedPage() {
  return (
    <FilteredItemsView
      title="Arquivados"
      icon={Archive}
      emptyDescription="Itens arquivados saem da visão principal, mas continuam aqui."
      filter={(item) => item.isArchived && !item.isDeleted}
    />
  );
}
