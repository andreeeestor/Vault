import Link from "next/link";
import {
  ShieldCheck,
  ArrowUpRight,
  Lock,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { AuthShowcase } from "@/components/auth/auth-showcase";

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
        <div className="flex w-full flex-col md:max-w-[440px]">
          <div className="flex flex-1 flex-col justify-center px-10 py-12 sm:px-14">
            <Link href="/" className="mb-10 flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-white"
                style={{ background: "var(--gradient-brand)" }}
              >
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[var(--foreground)]">
                Vault
              </span>
            </Link>

            {children}
          </div>

          <div className="hidden items-center justify-between gap-4 border-t border-[var(--border)] bg-[var(--background-elevated)] px-10 py-5 sm:flex">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--background-elevated)] bg-violet-500/20 text-violet-600">
                  <Lock className="h-3.5 w-3.5" />
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--background-elevated)] bg-sky-500/20 text-sky-600">
                  <ImageIcon className="h-3.5 w-3.5" />
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--background-elevated)] bg-emerald-500/20 text-emerald-600">
                  <FileText className="h-3.5 w-3.5" />
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--foreground)]">
                  Tudo o que você guarda, num só lugar
                </p>
                <p className="text-[11px] text-[var(--foreground-subtle)]">
                  Sem se perder entre apps diferentes
                </p>
              </div>
            </div>

            <Link
              href="/#features"
              aria-label="Ver recursos do Vault"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <AuthShowcase />
      </div>
    </div>
  );
}
