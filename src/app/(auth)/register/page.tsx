"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { registerUser } from "@/actions/auth";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    // confirmPassword não tem name no form, adicionamos manualmente
    const password = formData.get("password") as string;
    formData.set("confirmPassword", password); // simplificado: sem campo separado de confirmação

    const result = await registerUser(formData);
    setLoading(false);

    if (!result.ok) {
      toast.error(result.error ?? "Erro ao criar conta");
      return;
    }

    // Fazer login automaticamente após registro
    toast.success("Conta criada! Entrando…");
    const email = formData.get("email") as string;
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    window.location.href = "/vault";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-heading text-lg font-semibold text-[var(--foreground)]">Crie sua conta</h1>
        <p className="text-body mt-1 text-sm text-[var(--foreground-muted)]">
          500 MB grátis para começar a organizar tudo.
        </p>
      </div>

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/vault" })}
        className="flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
      >
        <GoogleIcon /> Continuar com Google
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs text-[var(--foreground-subtle)]">ou</span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input name="name" type="text" placeholder="Nome completo" required />
        <Input name="email" type="email" placeholder="E-mail" required />
        <Input name="password" type="password" placeholder="Senha (mín. 8 caracteres)" required minLength={8} />
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

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
