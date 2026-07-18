"use client";

import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FilteredItemsView } from "@/components/vault/filtered-items-view";

export default function SearchPage() {
  const params = useSearchParams();
  const query = (params.get("q") ?? "").toLowerCase();

  return (
    <FilteredItemsView
      title={query ? `Resultados para "${query}"` : "Busca"}
      icon={Search}
      emptyDescription="Tente outra palavra-chave ou verifique a grafia."
      filter={(item) => !item.isDeleted && item.title.toLowerCase().includes(query)}
    />
  );
}
