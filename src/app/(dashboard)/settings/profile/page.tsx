"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_USER } from "@/lib/mock-data";
import { toast } from "sonner";

export default function ProfileSettingsPage() {
  const initials = MOCK_USER.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-8">
      <section className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold text-white"
          style={{ background: "var(--gradient-brand)" }}
        >
          {initials}
        </div>
        <div>
          <Button variant="secondary" size="sm" onClick={() => toast("Selecione uma nova foto")}>
            Alterar foto
          </Button>
          <p className="mt-1.5 text-xs text-[var(--foreground-subtle)]">JPG, PNG. Máx 5MB.</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-[var(--foreground)]">Nome</label>
          <Input defaultValue={MOCK_USER.name} className="mt-1.5" />
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--foreground)]">E-mail</label>
          <Input defaultValue={MOCK_USER.email} className="mt-1.5" type="email" />
        </div>
        <div>
          <Button onClick={() => toast.success("Perfil atualizado")}>Salvar alterações</Button>
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-red-500/20 bg-red-500/5 p-5">
        <h3 className="text-heading text-sm font-semibold text-[var(--danger)]">Excluir conta</h3>
        <p className="text-body mt-1 text-sm text-[var(--foreground-muted)]">
          Remove permanentemente sua conta, arquivos e senhas salvas. Esta ação não pode ser desfeita.
        </p>
        <Button
          variant="danger"
          size="sm"
          className="mt-3"
          onClick={() => toast("Confirme a exclusão por e-mail")}
        >
          Excluir minha conta
        </Button>
      </section>
    </div>
  );
}
