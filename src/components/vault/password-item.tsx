"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Check, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

/**
 * Demonstração de UI. Em produção, "Revelar" chama uma Server Action que:
 *  1. Recebe a senha mestra (nunca fica em estado global do client)
 *  2. Valida contra vaultMasterKeyHash (lib/crypto.ts → verifyMasterPassword)
 *  3. Decifra encryptedPassword com a senha mestra + vaultSalt
 *  4. Retorna o texto plano apenas nesta resposta — nunca é persistido no client
 */
export function PasswordField({
  label,
  username,
}: {
  label: string;
  username?: string;
}) {
  const [revealed, setRevealed] = useState<string | null>(null);
  const [masterPassword, setMasterPassword] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReveal = () => {
    // TODO(produção): substituir por chamada a Server Action `revealPassword(itemId, masterPassword)`
    if (masterPassword.length < 1) return;
    setRevealed("S3nh4-D3m0nstr4ção!");
    setDialogOpen(false);
    setMasterPassword("");
  };

  const copy = async () => {
    if (!revealed) return;
    await navigator.clipboard.writeText(revealed);
    setCopied(true);
    toast.success("Copiado — clipboard será limpo em 30s");
    setTimeout(() => setCopied(false), 2000);
    setTimeout(() => navigator.clipboard.writeText("").catch(() => undefined), 30_000);
  };

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
      {username && (
        <div>
          <label className="text-xs font-medium text-[var(--foreground-subtle)]">Usuário</label>
          <p className="text-sm text-[var(--foreground)]">{username}</p>
        </div>
      )}

      <div>
        <label className="text-xs font-medium text-[var(--foreground-subtle)]">{label}</label>
        <div className="mt-1 flex items-center gap-2">
          <code className="flex-1 truncate rounded-[var(--radius-md)] bg-[var(--background-elevated)] px-3 py-2.5 font-mono text-sm text-[var(--foreground)]">
            {revealed ?? "••••••••••••"}
          </code>

          {revealed ? (
            <>
              <Button variant="secondary" size="icon" onClick={() => setRevealed(null)} aria-label="Ocultar">
                <EyeOff className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" onClick={copy} aria-label="Copiar">
                {copied ? <Check className="h-4 w-4 text-[var(--success)]" /> : <Copy className="h-4 w-4" />}
              </Button>
            </>
          ) : (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="icon" aria-label="Revelar">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent
                title="Confirme sua senha mestra"
                description="Diferente da sua senha de login — protege apenas o cofre de senhas."
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-2 rounded-[var(--radius-md)] bg-[var(--background-elevated)] p-3 text-xs text-[var(--foreground-muted)]">
                    <ShieldQuestion className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                    A senha é decifrada no servidor com AES-256-GCM e só é enviada ao navegador nesta
                    resposta — nunca fica salva sem criptografia.
                  </div>
                  <Input
                    type="password"
                    autoFocus
                    placeholder="Senha mestra"
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleReveal()}
                  />
                  <Button onClick={handleReveal} className="w-full">
                    Revelar senha
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
