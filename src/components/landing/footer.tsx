import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <section className="px-6 py-24 lg:px-10" style={{ background: "#F4EFE8" }}>
      <div
        className="nb-shadow mx-auto flex max-w-4xl flex-col items-center rounded-3xl border-2 border-[#1E1B2E] bg-[#1E1B2E] px-8 py-16 text-center"
      >
        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/70">
          Comece hoje
        </span>
        <h2 className="font-serif mt-5 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
          Pare de espalhar sua vida em 6 apps diferentes
        </h2>
        <p className="mt-4 max-w-md text-base leading-relaxed text-white/55">
          Crie sua conta gratuita agora e organize tudo em um único cofre — sem cartão de crédito.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="flex items-center gap-2 rounded-full bg-[#7C3AED] px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#6D28D9] active:scale-95"
          >
            Criar conta grátis <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/20 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white/80 transition-all hover:bg-white/15"
          >
            Já tenho conta
          </Link>
        </div>

        <p className="mt-4 text-xs text-white/30">Sem cartão de crédito · 500 MB grátis</p>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer
      className="border-t border-[#1E1B2E]/10 px-6 py-10 lg:px-10"
      style={{ background: "#F4EFE8" }}
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)" }}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
          <span className="font-serif text-sm font-bold text-[#1E1B2E]">Vault</span>
        </div>

        <nav className="flex gap-6 text-sm text-[#1E1B2E]/50">
          <a href="#features" className="transition-colors hover:text-[#1E1B2E]">Recursos</a>
          <a href="#pricing" className="transition-colors hover:text-[#1E1B2E]">Planos</a>
          <Link href="/login" className="transition-colors hover:text-[#1E1B2E]">Entrar</Link>
        </nav>

        <p className="text-xs text-[#1E1B2E]/30">
          © {new Date().getFullYear()} Vault. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
