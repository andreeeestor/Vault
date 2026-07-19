"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";


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
    <section id="pricing" className="px-6 py-24 lg:px-10" style={{ background: "#F4EFE8" }}>
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#7C3AED]">
            Planos
          </span>
          <h2 className="font-serif mt-3 text-4xl font-black leading-tight tracking-tight text-[#1E1B2E] sm:text-5xl">
            Um plano para cada estágio
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#1E1B2E]/55">
            Comece de graça. Faça upgrade quando o Vault se tornar essencial no seu dia a dia.
          </p>

          {/* Toggle */}
          <div className="mt-6 inline-flex items-center gap-1 rounded-full border-2 border-[#1E1B2E] bg-white p-1">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
                !yearly ? "bg-[#1E1B2E] text-white" : "text-[#1E1B2E]/50"
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
                yearly ? "bg-[#1E1B2E] text-white" : "text-[#1E1B2E]/50"
              )}
            >
              Anual <span className="opacity-70">— 2 meses grátis</span>
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const price = yearly ? plan.priceYearly : plan.priceMonthly;
            return (
              <div
                key={plan.id}
                className={cn(
                  "nb-shadow relative flex flex-col gap-5 rounded-2xl border-2 border-[#1E1B2E] p-6",
                  plan.highlight ? "bg-[#7C3AED] text-white" : "bg-white"
                )}
              >
                {plan.highlight && (
                  <span
                    className="absolute -top-3.5 left-5 rounded-full border-2 border-[#1E1B2E] bg-[#A855F7] px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
                  >
                    Mais popular
                  </span>
                )}
                <div>
                  <h3 className={cn(
                    "font-serif text-xl font-black",
                    plan.highlight ? "text-white" : "text-[#1E1B2E]"
                  )}>{plan.name}</h3>
                  <p className="mt-2 flex items-baseline gap-1">
                    <span className={cn(
                      "font-serif text-4xl font-black",
                      plan.highlight ? "text-white" : "text-[#1E1B2E]"
                    )}>
                      R$ {price}
                    </span>
                    <span className={cn(
                      "text-sm",
                      plan.highlight ? "text-white/60" : "text-[#1E1B2E]/40"
                    )}>/mês</span>
                  </p>
                  <p className={cn(
                    "mt-1 text-xs",
                    plan.highlight ? "text-white/60" : "text-[#1E1B2E]/40"
                  )}>{plan.storage} de armazenamento</p>
                </div>

                <ul className={cn(
                  "flex flex-1 flex-col gap-2.5 text-sm",
                  plan.highlight ? "text-white/80" : "text-[#1E1B2E]/60"
                )}>
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className={cn(
                        "mt-0.5 h-3.5 w-3.5 shrink-0",
                        plan.highlight ? "text-white" : "text-[#7C3AED]"
                      )} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={cn(
                    "rounded-full border-2 px-5 py-2.5 text-center text-sm font-bold transition-all hover:opacity-90 active:scale-95",
                    plan.highlight
                      ? "border-white bg-white text-[#7C3AED]"
                      : "border-[#1E1B2E] bg-[#1E1B2E] text-white"
                  )}
                >
                  {plan.cta}
                </Link>
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
    <section id="faq" className="px-6 py-24 lg:px-10" style={{ background: "#EDE9F5" }}>
      <div className="mx-auto max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-widest text-[#7C3AED]">FAQ</span>
        <h2 className="font-serif mt-3 text-4xl font-black leading-tight tracking-tight text-[#1E1B2E]">
          Perguntas frequentes
        </h2>

        <div className="mt-10 flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.q}
                className={cn(
                  "nb-shadow rounded-xl border-2 border-[#1E1B2E] bg-white overflow-hidden transition-all",
                  isOpen && "bg-[#FAF8FF]"
                )}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-serif text-sm font-bold text-[#1E1B2E]">{faq.q}</span>
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#1E1B2E] text-sm font-black text-[#1E1B2E] transition-transform",
                      isOpen && "rotate-45 bg-[#7C3AED] border-[#7C3AED] text-white"
                    )}
                  >
                    +
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-[#1E1B2E]/55">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
