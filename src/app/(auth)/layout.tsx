import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: "var(--gradient-brand-soft)" }}
    >
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-white"
            style={{ background: "var(--gradient-brand)" }}
          >
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-heading text-xl font-bold text-[var(--foreground)]">Vault</span>
        </Link>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-7 shadow-[var(--shadow-lg)]">
          {children}
        </div>
      </div>
    </div>
  );
}
