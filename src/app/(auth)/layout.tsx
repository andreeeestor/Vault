import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  FolderTree,
} from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: "var(--gradient-brand-soft)" }}
    >
      <div className="flex w-full max-w-[1000px] min-h-[640px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]">
        <div className="flex flex-1 flex-col justify-center px-14 py-12 relative">
          <Link
            href="/"
            className="absolute top-8 left-14 flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] text-sm font-medium text-[var(--foreground-muted)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>

          <Link
            href="/"
            className="absolute top-8 right-14 flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] text-sm font-semibold text-[var(--foreground)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <div
              className="flex h-5 w-5 items-center justify-center rounded-md text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <ShieldCheck className="h-3 w-3" />
            </div>
            Vault
          </Link>

          {children}
        </div>

        <div className="relative hidden flex-1 overflow-hidden md:block">
          <img
            src="/bg-auth.png"
            alt="Vault digital storage"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-[rgba(124,58,237,0.2)] to-[rgba(124,58,237,0.5)]" />

          <div className="absolute top-12 left-10 max-w-65 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/30">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Cofre Criptografado
                </h4>
                <p className="text-[11px] text-white/70">
                  AES-256-GCM · PBKDF2
                </p>
              </div>
            </div>
            <p className="text-[12px] text-white/80 leading-relaxed">
              Suas senhas são cifradas individualmente. A chave nunca sai da
              memória.
            </p>
          </div>

          <div className="absolute bottom-12 left-10 right-10 max-w-[320px] rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/30">
                  <FolderTree className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Tudo em um só lugar
                  </h4>
                  <p className="text-[11px] text-white/70">
                    Imagens · PDFs · Notas · Snippets · Links · Senhas
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/30 backdrop-blur-sm border border-rose-400/40">
                <span className="text-[10px] font-bold text-rose-200">IMG</span>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/30 backdrop-blur-sm border border-amber-400/40">
                <span className="text-[10px] font-bold text-amber-200">
                  PDF
                </span>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/30 backdrop-blur-sm border border-sky-400/40">
                <span className="text-[10px] font-bold text-sky-200">AUD</span>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/30 backdrop-blur-sm border border-emerald-400/40">
                <span className="text-[10px] font-bold text-emerald-200">
                  MD
                </span>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/30 backdrop-blur-sm border border-violet-400/40">
                <span className="text-[10px] font-bold text-violet-200">
                  JS
                </span>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/30 backdrop-blur-sm border border-purple-400/40">
                <span className="text-[10px] font-bold text-purple-200">
                  KEY
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
