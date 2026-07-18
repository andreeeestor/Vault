"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success("Link de redefinição enviado, se o e-mail existir.");
  };

  if (sent) {
    return (
      <p className="text-body text-center text-sm text-[var(--foreground-muted)]">
        Verifique sua caixa de entrada para redefinir sua senha.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h1 className="text-heading text-lg font-semibold text-[var(--foreground)]">Redefinir senha</h1>
        <p className="text-body mt-1 text-sm text-[var(--foreground-muted)]">
          Enviaremos um link para você criar uma nova senha.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input type="email" placeholder="E-mail" required />
        <Button type="submit">Enviar link</Button>
      </form>
    </div>
  );
}
