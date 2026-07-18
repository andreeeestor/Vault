"use client";

import { Star } from "lucide-react";
import { FilteredItemsView } from "@/components/vault/filtered-items-view";

export default function FavoritesPage() {
  return (
    <FilteredItemsView
      title="Favoritos"
      icon={Star}
      emptyDescription="Marque itens com a estrela para encontrá-los rapidamente aqui."
      filter={(item) => item.isFavorite && !item.isDeleted && !item.isArchived}
    />
  );
}
