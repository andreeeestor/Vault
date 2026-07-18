"use client";

import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export function LandingHeader() {
  return (
    <header className="glass sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[var(--border)] px-6 lg:px-10">
      <Link href="/" className="flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-white"
          style={{ background: "var(--gradient-brand)" }}
        >
          <ShieldCheck className="h-4 w-4" />
        </div>
        <span className="text-heading text-lg font-bold text-[var(--foreground)]">Vault</span>
      </Link>

      <nav className="hidden items-center gap-6 text-sm text-[var(--foreground-muted)] md:flex">
        <a href="#features" className="transition-colors hover:text-[var(--foreground)]">Recursos</a>
        <a href="#security" className="transition-colors hover:text-[var(--foreground)]">Segurança</a>
        <a href="#pricing" className="transition-colors hover:text-[var(--foreground)]">Planos</a>
        <a href="#faq" className="transition-colors hover:text-[var(--foreground)]">FAQ</a>
      </nav>

      <div className="flex items-center gap-3">
        <Link href="/login" className="hidden text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] sm:block">
          Entrar
        </Link>
        <Button asChild size="sm">
          <Link href="/register">Criar conta grátis</Link>
        </Button>
      </div>
    </header>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-16 pb-24 lg:px-10 lg:pt-24">
      <div
        className="absolute inset-x-0 top-0 -z-10 h-[600px]"
        style={{ background: "var(--gradient-brand-soft)" }}
      />

      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--primary)]"
        >
          Criptografia AES-256 · Organização estilo Google Drive
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-display mt-6 text-4xl font-bold text-[var(--foreground)] sm:text-5xl lg:text-6xl"
        >
          Tudo o que importa,{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            em um só cofre
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-body mt-5 max-w-xl text-base text-[var(--foreground-muted)] sm:text-lg"
        >
          Imagens, PDFs, áudios, notas, snippets, links e senhas — organizados em pastas que você já
          sabe usar. Arraste, solte e encontre qualquer coisa em segundos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button asChild size="lg">
            <Link href="/register">
              Começar de graça <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <span className="text-xs text-[var(--foreground-subtle)]">
            Sem cartão de crédito · 500 MB grátis
          </span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mx-auto mt-16 max-w-5xl"
      >
        <DriveInterfacePreview />
      </motion.div>
    </section>
  );
}

function DriveInterfacePreview() {
  const items = [
    { name: "Contratos", color: "#7C3AED", count: 12 },
    { name: "Fotos da viagem", color: "#0284C7", count: 48 },
    { name: "Senhas", color: "#E11D48", count: 23 },
    { name: "Notas de reunião", color: "#D97706", count: 9 },
  ];

  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]">
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--background-elevated)] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 text-xs text-[var(--foreground-subtle)]">Meu Vault</span>
      </div>
      <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background-elevated)] p-4"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]"
              style={{ background: `${item.color}22` }}
            >
              <div className="h-4 w-4 rounded-sm" style={{ background: item.color }} />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">{item.name}</p>
              <p className="text-xs text-[var(--foreground-subtle)]">{item.count} itens</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
