"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/actions/user";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("O nome não pode estar vazio.");
      return;
    }
    startTransition(async () => {
      try {
        await updateProfile({ name: name.trim() });
        toast.success("Perfil atualizado!");
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao atualizar perfil.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="flex items-center gap-4">
        {user.image ? (
          <img
            src={user.image}
            alt={name}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold text-white"
            style={{ background: "var(--gradient-brand)" }}
          >
            {initials}
          </div>
        )}
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
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--foreground)]">E-mail</label>
          <Input defaultValue={user.email} disabled className="mt-1.5 opacity-60 cursor-not-allowed" type="email" />
          <p className="mt-1 text-xs text-[var(--foreground-subtle)]">O e-mail não pode ser alterado.</p>
        </div>
        <div>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Salvando…" : "Salvar alterações"}
          </Button>
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
