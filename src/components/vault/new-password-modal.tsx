"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { createPasswordItem, setupMasterPassword } from "@/actions/vault-crypto";
import { useVaultStore } from "@/lib/vault-store";

interface NewPasswordModalProps {
  open: boolean;
  onClose: () => void;
  /** Se false, o usuário ainda não configurou a senha mestra */
  hasMasterPassword: boolean;
}

type Step = "setup" | "create";

export function NewPasswordModal({
  open,
  onClose,
  hasMasterPassword,
}: NewPasswordModalProps) {
  const currentFolderId = useVaultStore((s) => s.currentFolderId);

  const [step, setStep] = useState<Step>(hasMasterPassword ? "create" : "setup");

  // Campos setup
  const [newMaster, setNewMaster] = useState("");
  const [confirmMaster, setConfirmMaster] = useState("");
  const [showNewMaster, setShowNewMaster] = useState(false);

  // Campos criação
  const [master, setMaster] = useState("");
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showMaster, setShowMaster] = useState(false);

  const [isPending, startTransition] = useTransition();

  const folderId =
    !currentFolderId || currentFolderId === "root" ? null : currentFolderId;

  const strength = calcStrength(password);
  const strengthLabel = ["Muito fraca", "Fraca", "Média", "Forte", "Muito forte"][strength];
  const strengthColor = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500"][strength];

  const handleSetup = () => {
    if (!newMaster.trim() || newMaster.length < 8) {
      toast.error("A senha mestra deve ter pelo menos 8 caracteres.");
      return;
    }
    if (newMaster !== confirmMaster) {
      toast.error("As senhas mestras não coincidem.");
      return;
    }
    startTransition(async () => {
      try {
        await setupMasterPassword(newMaster);
        toast.success("Senha mestra configurada!");
        setMaster(newMaster);
        setNewMaster("");
        setConfirmMaster("");
        setStep("create");
      } catch (e) {
        toast.error("Erro ao configurar senha mestra.");
        console.error(e);
      }
    });
  };

  const handleCreate = () => {
    if (!title.trim()) { toast.error("Informe um título."); return; }
    if (!password.trim()) { toast.error("A senha não pode estar vazia."); return; }
    if (!master.trim()) { toast.error("Informe sua senha mestra."); return; }

    startTransition(async () => {
      try {
        await createPasswordItem({
          title: title.trim(),
          password,
          username: username.trim() || undefined,
          notes: notes.trim() || undefined,
          folderId,
          masterPassword: master,
        });
        toast.success("Senha salva com segurança!");
        handleClose();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Erro ao salvar senha.";
        toast.error(msg);
      }
    });
  };

  const handleClose = () => {
    setStep(hasMasterPassword ? "create" : "setup");
    setNewMaster(""); setConfirmMaster(""); setMaster("");
    setTitle(""); setUsername(""); setPassword(""); setNotes("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent showClose={false} className="p-0 overflow-hidden max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "var(--gradient-brand)" }}
          >
            <KeyRound className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-heading text-base font-semibold text-[var(--foreground)]">
              {step === "setup" ? "Configurar cofre de senhas" : "Nova senha"}
            </h2>
            <p className="text-xs text-[var(--foreground-subtle)] mt-0.5">
              {step === "setup"
                ? "Defina sua chave mestra para proteger suas senhas"
                : "Suas senhas são criptografadas com sua chave mestra"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          {step === "setup" ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <p className="text-xs text-[var(--foreground-muted)]">
                  A senha mestra <strong className="text-[var(--foreground)]">não pode ser recuperada</strong>. Se perdida, as senhas salvas não poderão ser decifradas.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">Nova senha mestra</label>
                <div className="relative mt-1.5">
                  <Input
                    type={showNewMaster ? "text" : "password"}
                    value={newMaster}
                    onChange={(e) => setNewMaster(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowNewMaster(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-subtle)]">
                    {showNewMaster ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">Confirmar senha mestra</label>
                <Input
                  type="password"
                  value={confirmMaster}
                  onChange={(e) => setConfirmMaster(e.target.value)}
                  placeholder="Repita a senha mestra"
                  className="mt-1.5"
                  onKeyDown={(e) => e.key === "Enter" && handleSetup()}
                />
              </div>

              <Button onClick={handleSetup} disabled={isPending} className="w-full">
                <Lock className="h-4 w-4" />
                {isPending ? "Configurando…" : "Definir senha mestra"}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Título <span className="text-[var(--danger)]">*</span>
                </label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Gmail, Netflix, Banco…" className="mt-1.5" />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">Usuário / E-mail</label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="usuario@email.com" className="mt-1.5" />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Senha <span className="text-[var(--danger)]">*</span>
                </label>
                <div className="relative mt-1.5">
                  <Input type={showPass ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="Senha a guardar" className="pr-10" />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-subtle)]">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex flex-1 gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor : "bg-[var(--border-strong)]"}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[var(--foreground-subtle)]">{strengthLabel}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">Notas</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informações adicionais…" rows={2}
                  className="mt-1.5 w-full resize-none rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-subtle)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div className="border-t border-[var(--border)] pt-4">
                <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)]">
                  <Lock className="h-3.5 w-3.5 text-[var(--primary)]" />
                  Senha mestra <span className="text-[var(--danger)]">*</span>
                </label>
                <div className="relative mt-1.5">
                  <Input type={showMaster ? "text" : "password"} value={master}
                    onChange={(e) => setMaster(e.target.value)}
                    placeholder="Sua chave de criptografia"
                    className="pr-10"
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
                  <button type="button" onClick={() => setShowMaster(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-subtle)]">
                    {showMaster ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button onClick={handleCreate} disabled={isPending} className="w-full">
                <KeyRound className="h-4 w-4" />
                {isPending ? "Salvando…" : "Salvar senha com segurança"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function calcStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(4, score);
}
