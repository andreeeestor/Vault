import { MailCheck } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "var(--gradient-brand-soft)" }}
      >
        <MailCheck className="h-5 w-5 text-[var(--primary)]" />
      </div>
      <h1 className="text-heading text-lg font-semibold text-[var(--foreground)]">Confirme seu e-mail</h1>
      <p className="text-body text-sm text-[var(--foreground-muted)]">
        Enviamos um link de confirmação. Clique nele para ativar sua conta e acessar o Vault.
      </p>
    </div>
  );
}
