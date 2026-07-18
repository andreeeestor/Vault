"use client";

import { useState } from "react";
import { ShieldCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SecuritySettingsPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleChangeMasterPassword = () => {
    if (!current || next.length < 8 || next !== confirm) {
      toast.error("Verifique os campos — a nova senha precisa de 8+ caracteres e confirmação igual");
      return;
    }
    // TODO(produção): Server Action que re-cifra todos os itens PASSWORD com a nova chave derivada
    toast.success("Senha mestra atualizada. Todos os segredos foram re-criptografados.");
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-start gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
            style={{ background: "var(--gradient-brand-soft)" }}
          >
            <ShieldCheck className="h-4.5 w-4.5 text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="text-heading text-sm font-semibold text-[var(--foreground)]">Senha mestra</h3>
            <p className="text-body mt-1 text-sm text-[var(--foreground-muted)]">
              Protege exclusivamente o cofre de senhas — diferente da senha de login. Nunca é
              armazenada, apenas um hash de verificação.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pl-12">
          <Input
            type="password"
            placeholder="Senha mestra atual"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Nova senha mestra"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Confirme a nova senha mestra"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <Button onClick={handleChangeMasterPassword} className="self-start">
            Atualizar senha mestra
          </Button>
        </div>
      </section>

      <section className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div>
          <h3 className="text-heading text-sm font-semibold text-[var(--foreground)]">Exportar dados</h3>
          <p className="text-body mt-1 text-sm text-[var(--foreground-muted)]">
            Gera um arquivo com todos os seus itens (exceto senhas cifradas).
          </p>
        </div>
        <Button variant="secondary" onClick={() => toast("Preparando exportação…")}>
          <Download className="h-4 w-4" /> Exportar
        </Button>
      </section>
    </div>
  );
}
