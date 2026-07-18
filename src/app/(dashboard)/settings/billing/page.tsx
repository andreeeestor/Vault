"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "R$ 0",
    period: "sempre",
    storage: "500 MB",
    features: ["Pastas ilimitadas", "Todos os tipos de item", "1 dispositivo por vez"],
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 19",
    period: "/mês",
    storage: "50 GB",
    features: [
      "Tudo do Free",
      "Cofre de senhas ilimitado",
      "Histórico de versões",
      "Suporte prioritário",
    ],
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    price: "R$ 49",
    period: "/mês",
    storage: "500 GB",
    features: ["Tudo do Pro", "Compartilhamento em equipe", "Logs de auditoria", "SSO"],
    highlight: false,
  },
];

export default function BillingSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
              Plano atual
            </p>
            <p className="text-heading text-lg font-semibold text-[var(--foreground)]">Pro</p>
          </div>
          <span className="rounded-full bg-[var(--gradient-brand-soft)] px-3 py-1 text-xs font-medium text-[var(--primary)]">
            1,2 GB de 50 GB usados
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col gap-4 rounded-[var(--radius-lg)] border p-5",
              plan.highlight
                ? "border-[var(--primary)] shadow-[var(--shadow-glow)]"
                : "border-[var(--border)]"
            )}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white" style={{ background: "var(--gradient-brand)" }}>
                Mais popular
              </span>
            )}
            <div>
              <h3 className="text-heading font-semibold text-[var(--foreground)]">{plan.name}</h3>
              <p className="mt-1">
                <span className="text-display text-2xl font-bold text-[var(--foreground)]">
                  {plan.price}
                </span>
                <span className="text-sm text-[var(--foreground-subtle)]"> {plan.period}</span>
              </p>
              <p className="mt-1 text-xs text-[var(--foreground-subtle)]">{plan.storage} de armazenamento</p>
            </div>

            <ul className="flex flex-col gap-2 text-sm text-[var(--foreground-muted)]">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              variant={plan.highlight ? "primary" : "secondary"}
              onClick={() => toast(plan.id === "pro" ? "Você já está no Pro" : `Mudando para ${plan.name}…`)}
              className="mt-auto"
            >
              {plan.id === "pro" ? "Plano atual" : "Escolher plano"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
