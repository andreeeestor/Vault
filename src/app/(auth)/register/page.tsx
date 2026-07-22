"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconInput } from "@/components/auth/icon-input";
import { toast } from "sonner";
import { registerUser } from "@/actions/auth";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    formData.set("confirmPassword", password);

    const result = await registerUser(formData);
    setLoading(false);

    if (!result.ok) {
      toast.error(result.error ?? "Erro ao criar conta");
      return;
    }

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
    <div className="flex w-full flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight text-[var(--foreground)]">
          Crie sua conta
        </h1>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          500 MB grátis para começar a organizar tudo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <IconInput
          icon={<User className="h-4 w-4" />}
          name="name"
          type="text"
          placeholder="Seu nome"
          required
        />

        <IconInput
          icon={<Mail className="h-4 w-4" />}
          name="email"
          type="email"
          placeholder="seu@email.com"
          required
        />

        <IconInput
          icon={<Lock className="h-4 w-4" />}
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Mín. 8 caracteres"
          required
          minLength={8}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-[var(--foreground-subtle)] transition-colors hover:text-[var(--foreground)]"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        <Button
          type="submit"
          disabled={loading}
          className="h-[52px] rounded-full text-[15px] font-semibold shadow-[0_4px_14px_rgba(124,58,237,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(124,58,237,0.45)] active:translate-y-0"
        >
          {loading ? "Criando conta…" : "Criar conta gratuita"}
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs font-medium text-[var(--foreground-subtle)]">
          ou
        </span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/vault" })}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
      >
        <GoogleIcon /> Continuar com Google
      </button>

      <p className="mt-2 text-center text-xs text-[var(--foreground-subtle)]">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="font-medium text-[var(--primary)] underline underline-offset-2 hover:text-[var(--primary-hover)]"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
