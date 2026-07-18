"use client";

import { FileClock } from "lucide-react";
import { FilteredItemsView } from "@/components/vault/filtered-items-view";

export default function TrashPage() {
  return (
    <FilteredItemsView
      title="Lixeira"
      icon={FileClock}
      emptyDescription="Itens excluídos ficam aqui por 30 dias antes de serem removidos permanentemente."
      filter={(item) => item.isDeleted}
    />
  );
}
