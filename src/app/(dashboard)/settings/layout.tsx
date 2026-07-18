"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/settings/profile", label: "Perfil" },
  { href: "/settings/security", label: "Segurança" },
  { href: "/settings/billing", label: "Plano e faturamento" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbItem active>Configurações</BreadcrumbItem>
          </Breadcrumb>
        }
      />
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <h1 className="text-display text-2xl font-bold text-[var(--foreground)]">Configurações</h1>

        <nav className="mt-6 flex gap-1 border-b border-[var(--border)]">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "text-[var(--foreground)]" : "text-[var(--foreground-subtle)] hover:text-[var(--foreground)]"
                )}
              >
                {tab.label}
                {active && (
                  <span
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full"
                    style={{ background: "var(--gradient-brand)" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
