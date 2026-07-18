"use client";

import { KeyRound } from "lucide-react";
import { FilteredItemsView } from "@/components/vault/filtered-items-view";

export default function PasswordsPage() {
  return (
    <FilteredItemsView
      title="Senhas"
      icon={KeyRound}
      emptyDescription="Guarde suas credenciais com criptografia AES-256 protegida por senha mestra."
      filter={(item) => item.type === "PASSWORD" && !item.isDeleted}
    />
  );
}
