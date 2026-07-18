"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO(produção): Server Action que cria o usuário (bcrypt) + envia e-mail de verificação via Resend
    setTimeout(() => {
      setLoading(false);
      toast.success("Conta criada! Verifique seu e-mail.");
      window.location.href = "/verify-email";
    }, 900);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-heading text-lg font-semibold text-[var(--foreground)]">Crie sua conta</h1>
        <p className="text-body mt-1 text-sm text-[var(--foreground-muted)]">
          500 MB grátis para começar a organizar tudo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input type="text" placeholder="Nome completo" required />
        <Input type="email" placeholder="E-mail" required />
        <Input type="password" placeholder="Senha (mín. 8 caracteres)" required minLength={8} />
        <Button type="submit" disabled={loading}>
          {loading ? "Criando conta…" : "Criar conta gratuita"}
        </Button>
      </form>

      <p className="text-center text-xs text-[var(--foreground-subtle)]">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-medium text-[var(--primary)] hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
