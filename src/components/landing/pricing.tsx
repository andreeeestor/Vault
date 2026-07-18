"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    storage: "500 MB",
    features: ["Pastas ilimitadas", "Todos os tipos de item", "Busca global"],
    cta: "Começar de graça",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 19,
    priceYearly: 15,
    storage: "50 GB",
    features: ["Tudo do Free", "Cofre de senhas ilimitado", "Histórico de versões", "Suporte prioritário"],
    cta: "Assinar Pro",
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    priceMonthly: 49,
    priceYearly: 39,
    storage: "500 GB",
    features: ["Tudo do Pro", "Compartilhamento em equipe", "Logs de auditoria", "SSO"],
    cta: "Assinar Business",
    highlight: false,
  },
];

const FAQS = [
  {
    q: "Minhas senhas ficam realmente seguras?",
    a: "Sim. Cada senha é cifrada individualmente com AES-256-GCM, usando uma chave derivada da sua senha mestra via PBKDF2 com mais de 120 mil iterações. Nem a equipe do Vault consegue lê-las.",
  },
  {
    q: "Posso mudar de plano depois?",
    a: "Sim, a qualquer momento. Upgrades são aplicados imediatamente; downgrades entram em vigor no próximo ciclo de cobrança.",
  },
  {
    q: "O que acontece se eu esquecer minha senha mestra?",
    a: "Como não guardamos sua senha mestra, não é possível recuperá-la — apenas redefinir o cofre de senhas (o que apaga as senhas salvas). Os demais itens do Vault continuam intactos.",
  },
  {
    q: "Existe limite de dispositivos?",
    a: "No plano Free, um dispositivo ativo por vez. Pro e Business liberam acesso simultâneo em múltiplos dispositivos.",
  },
];

export function Pricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <section id="pricing" className="px-6 py-24 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-display text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
            Um plano para cada estágio
          </h2>
          <p className="text-body mt-3 text-[var(--foreground-muted)]">
            Comece de graça. Faça upgrade quando o Vault se tornar essencial no seu dia a dia.
          </p>

          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] p-1">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                !yearly ? "bg-[var(--primary)] text-white" : "text-[var(--foreground-muted)]"
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                yearly ? "bg-[var(--primary)] text-white" : "text-[var(--foreground-muted)]"
              )}
            >
              Anual <span className="opacity-80">— 2 meses grátis</span>
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const price = yearly ? plan.priceYearly : plan.priceMonthly;
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col gap-5 rounded-[var(--radius-lg)] border p-6",
                  plan.highlight
                    ? "border-[var(--primary)] shadow-[var(--shadow-glow)]"
                    : "border-[var(--border)] bg-[var(--surface)]"
                )}
              >
                {plan.highlight && (
                  <span
                    className="absolute -top-3 left-6 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    Mais popular
                  </span>
                )}
                <div>
                  <h3 className="text-heading font-semibold text-[var(--foreground)]">{plan.name}</h3>
                  <p className="mt-2 flex items-baseline gap-1">
                    <span className="text-display text-3xl font-bold text-[var(--foreground)]">
                      R$ {price}
                    </span>
                    <span className="text-sm text-[var(--foreground-subtle)]">/mês</span>
                  </p>
                  <p className="mt-1 text-xs text-[var(--foreground-subtle)]">{plan.storage} de armazenamento</p>
                </div>

                <ul className="flex flex-1 flex-col gap-2.5 text-sm text-[var(--foreground-muted)]">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button asChild variant={plan.highlight ? "primary" : "secondary"}>
                  <Link href="/register">{plan.cta}</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="px-6 py-24 lg:px-10" style={{ background: "var(--background-elevated)" }}>
      <div className="mx-auto max-w-2xl">
        <h2 className="text-display text-center text-3xl font-bold text-[var(--foreground)]">
          Perguntas frequentes
        </h2>

        <div className="mt-10 flex flex-col divide-y divide-[var(--border)]">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={faq.q} className="py-4">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-sm font-medium text-[var(--foreground)]">{faq.q}</span>
                  <span
                    className={cn(
                      "ml-4 shrink-0 text-lg text-[var(--foreground-subtle)] transition-transform",
                      isOpen && "rotate-45"
                    )}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <p className="text-body mt-2.5 text-sm text-[var(--foreground-muted)]">{faq.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
