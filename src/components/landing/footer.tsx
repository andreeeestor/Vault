import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="px-6 py-24 lg:px-10">
      <div
        className="mx-auto flex max-w-4xl flex-col items-center rounded-[var(--radius-xl)] px-8 py-16 text-center"
        style={{ background: "var(--gradient-brand)" }}
      >
        <h2 className="text-display text-3xl font-bold text-white sm:text-4xl">
          Pare de espalhar sua vida em 6 apps diferentes
        </h2>
        <p className="text-body mt-3 max-w-md text-white/85">
          Crie sua conta gratuita agora e organize tudo em um único cofre — sem cartão de crédito.
        </p>
        <Button asChild size="lg" className="mt-7 bg-white text-[var(--primary)] hover:bg-white/90" variant="secondary">
          <Link href="/register">
            Criar conta grátis <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] px-6 py-10 lg:px-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-white"
            style={{ background: "var(--gradient-brand)" }}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold text-[var(--foreground)]">Vault</span>
        </div>

        <nav className="flex gap-6 text-sm text-[var(--foreground-muted)]">
          <a href="#features" className="hover:text-[var(--foreground)]">Recursos</a>
          <a href="#pricing" className="hover:text-[var(--foreground)]">Planos</a>
          <Link href="/login" className="hover:text-[var(--foreground)]">Entrar</Link>
        </nav>

        <p className="text-xs text-[var(--foreground-subtle)]">
          © {new Date().getFullYear()} Vault. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
