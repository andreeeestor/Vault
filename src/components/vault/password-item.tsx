"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Check, ShieldQuestion, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { VaultItem } from "@/types";
import { revealPassword } from "@/actions/vault-crypto";

export function PasswordField({ item }: { item: VaultItem }) {
  const [revealed, setRevealed] = useState<string | null>(null);
  const [decryptedUsername, setDecryptedUsername] = useState<string | null>(null);
  const [decryptedNotes, setDecryptedNotes] = useState<string | null>(null);
  const [masterPassword, setMasterPassword] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReveal = async () => {
    if (!masterPassword.trim()) {
      toast.error("Informe a senha mestra.");
      return;
    }
    setIsLoading(true);
    try {
      const data = await revealPassword(item.id, masterPassword);
      setRevealed(data.password);
      setDecryptedUsername(data.username);
      setDecryptedNotes(data.notes);
      setDialogOpen(false);
      setMasterPassword("");
      toast.success("Credenciais descriptografadas!");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Senha mestra incorreta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHide = () => {
    setRevealed(null);
    setDecryptedUsername(null);
    setDecryptedNotes(null);
  };

  const copy = async () => {
    if (!revealed) return;
    await navigator.clipboard.writeText(revealed);
    setCopied(true);
    toast.success("Senha copiada para a área de transferência.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
          🔑
        </div>
        <div>
          <h3 className="font-semibold text-[var(--foreground)]">{item.title}</h3>
          <p className="text-xs text-[var(--foreground-subtle)]">Cofre de senhas criptografado</p>
        </div>
      </div>

      {revealed ? (
        <div className="flex flex-col gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
              <User className="h-3.5 w-3.5" /> Nome de Usuário / E-mail
            </label>
            <Input
              readOnly
              value={decryptedUsername || "Nenhum usuário salvo"}
              className="font-sans text-sm select-all bg-[var(--background-elevated)]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--foreground-muted)]">Senha</label>
            <div className="mt-1.5 flex items-center gap-2">
              <code className="flex-1 truncate rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] px-3 py-2.5 font-mono text-sm text-[var(--foreground)]">
                {revealed}
              </code>
              <Button variant="secondary" size="icon" onClick={handleHide} aria-label="Ocultar">
                <EyeOff className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" onClick={copy} aria-label="Copiar">
                {copied ? <Check className="h-4 w-4 text-[var(--success)]" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {decryptedNotes && (
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
                <FileText className="h-3.5 w-3.5" /> Observações Criptografadas
              </label>
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background-elevated)] p-3 text-sm text-[var(--foreground)] whitespace-pre-wrap font-sans">
                {decryptedNotes}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-sm text-[var(--foreground-subtle)] mb-4">
            Este item está protegido por criptografia de ponta a ponta. Digite sua senha mestra para visualizá-lo.
          </p>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto px-6">
                <Eye className="mr-2 h-4 w-4" /> Revelar credenciais
              </Button>
            </DialogTrigger>
            <DialogContent
              title="Confirme sua senha mestra"
              description="Sua senha mestra é usada localmente para descriptografar os dados protegidos."
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-2 rounded-[var(--radius-md)] bg-[var(--background-elevated)] p-3 text-xs text-[var(--foreground-muted)]">
                  <ShieldQuestion className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                  Os dados de senhas são descriptografados no servidor de forma segura com AES-256-GCM e nunca transitam sem proteção.
                </div>
                <Input
                  type="password"
                  autoFocus
                  placeholder="Senha mestra"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReveal()}
                  disabled={isLoading}
                />
                <Button onClick={handleReveal} disabled={isLoading} className="w-full">
                  {isLoading ? "Verificando..." : "Revelar credenciais"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
