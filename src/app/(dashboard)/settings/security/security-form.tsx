"use client";

import { useState, useTransition } from "react";
import { ShieldCheck, Download, Lock, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { setupMasterPassword, changeMasterPassword } from "@/actions/vault-crypto";

interface SecurityFormProps {
  hasMasterPassword: boolean;
}

export function SecurityForm({ hasMasterPassword }: SecurityFormProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAction = () => {
    if (!hasMasterPassword) {
      
      if (next.length < 8) {
        toast.error("A senha mestra precisa de pelo menos 8 caracteres.");
        return;
      }
      if (next !== confirm) {
        toast.error("As senhas não coincidem.");
        return;
      }
      startTransition(async () => {
        try {
          await setupMasterPassword(next);
          toast.success("Senha mestra configurada com sucesso!");
          setNext("");
          setConfirm("");
          
          window.location.reload();
        } catch (e) {
          toast.error("Erro ao configurar senha mestra.");
          console.error(e);
        }
      });
    } else {
      
      if (!current) {
        toast.error("Informe a senha mestra atual.");
        return;
      }
      if (next.length < 8) {
        toast.error("A nova senha mestra precisa de pelo menos 8 caracteres.");
        return;
      }
      if (next !== confirm) {
        toast.error("A nova senha e a confirmação não coincidem.");
        return;
      }
      startTransition(async () => {
        try {
          await changeMasterPassword(current, next);
          toast.success("Senha mestra atualizada. Todos os segredos foram re-criptografados com sucesso!");
          setCurrent("");
          setNext("");
          setConfirm("");
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Erro ao atualizar senha mestra.";
          toast.error(msg);
        }
      });
    }
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
          <div className="flex-1">
            <h3 className="text-heading text-sm font-semibold text-[var(--foreground)]">Senha mestra</h3>
            <p className="text-body mt-1 text-sm text-[var(--foreground-muted)]">
              {hasMasterPassword
                ? "Protege exclusivamente o cofre de senhas — diferente da senha de login. Nunca é armazenada nos nossos servidores, apenas um hash de verificação."
                : "Você ainda não possui uma senha mestra. Crie uma agora para começar a usar o cofre de senhas de forma 100% segura e criptografada."}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pl-12 max-w-md">
          {hasMasterPassword && (
            <div>
              <label className="text-xs font-medium text-[var(--foreground-subtle)]">Senha mestra atual</label>
              <Input
                type="password"
                placeholder="Informe a senha mestra atual"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-[var(--foreground-subtle)]">
              {hasMasterPassword ? "Nova senha mestra" : "Definir senha mestra"}
            </label>
            <Input
              type="password"
              placeholder={hasMasterPassword ? "Mínimo 8 caracteres" : "Digite uma senha mestra de 8+ caracteres"}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--foreground-subtle)]">Confirmar nova senha mestra</label>
            <Input
              type="password"
              placeholder="Confirme a nova senha mestra"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1"
              onKeyDown={(e) => e.key === "Enter" && handleAction()}
            />
          </div>
          <Button onClick={handleAction} disabled={isPending} className="self-start mt-2">
            <KeyRound className="h-4 w-4" />
            {isPending
              ? "Processando…"
              : hasMasterPassword
              ? "Atualizar senha mestra"
              : "Configurar senha mestra"}
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
