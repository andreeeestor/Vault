"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Slide {
  title: string;
  caption: string;
}

const SLIDES: Slide[] = [
  {
    title: "Cofre criptografado",
    caption:
      "Suas senhas são cifradas individualmente com AES-256-GCM. A chave nunca sai da memória.",
  },
  {
    title: "Tudo em um só lugar",
    caption:
      "Imagens, PDFs, notas, snippets, links e senhas — organizados como no Google Drive.",
  },
  {
    title: "Busca que entende você",
    caption:
      "Descreva o que procura, não como o arquivo se chama. A busca por IA encontra do jeito certo.",
  },
];

const CHIPS = [
  { label: "IMG", color: "rose", x: 118, y: 0 },
  { label: "PDF", color: "amber", x: 59, y: 102 },
  { label: "AUD", color: "sky", x: -59, y: 102 },
  { label: "MD", color: "emerald", x: -118, y: 0 },
  { label: "JS", color: "violet", x: -59, y: -102 },
  { label: "KEY", color: "purple", x: 59, y: -102 },
] as const;

const CHIP_STYLES: Record<(typeof CHIPS)[number]["color"], string> = {
  rose: "bg-rose-500/30 border-rose-400/40 text-rose-200",
  amber: "bg-amber-500/30 border-amber-400/40 text-amber-200",
  sky: "bg-sky-500/30 border-sky-400/40 text-sky-200",
  emerald: "bg-emerald-500/30 border-emerald-400/40 text-emerald-200",
  violet: "bg-violet-500/30 border-violet-400/40 text-violet-200",
  purple: "bg-purple-500/30 border-purple-400/40 text-purple-200",
};

export function AuthShowcase() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length);

  return (
    <div
      className="relative hidden flex-1 overflow-hidden md:block"
      style={{ background: "var(--gradient-brand)" }}
    >
      <div className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-10 h-80 w-80 rounded-full bg-black/20 blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />

      <div className="relative z-10 px-10 pt-12">
        <h2 className="max-w-xs text-2xl font-semibold leading-snug text-white">
          Tudo o que importa, em um só cofre.
        </h2>
      </div>

      <div className="relative z-10 flex h-[calc(100%-260px)] items-center justify-center">
        <div className="relative h-56 w-56">
          <div
            className="absolute inset-0"
            style={{ transform: "rotate(-8deg)" }}
          >
            <div className="h-full w-full animate-[float_6s_ease-in-out_infinite] rounded-[28px] border border-white/25 bg-white/10 backdrop-blur-xl" />
          </div>
          <div
            className="absolute inset-0"
            style={{ transform: "rotate(10deg) scale(0.92)" }}
          >
            <div className="h-full w-full animate-[float_7s_ease-in-out_infinite_0.4s] rounded-[28px] border border-white/20 bg-white/5 backdrop-blur-lg" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-white/30 bg-white/15 shadow-2xl backdrop-blur-md">
              <ShieldCheck className="h-11 w-11 text-white" strokeWidth={1.5} />
            </div>
          </div>

          {CHIPS.map((chip) => (
            <div
              key={chip.label}
              className={cn(
                "absolute flex h-9 w-9 items-center justify-center rounded-xl border text-[10px] font-bold backdrop-blur-sm",
                CHIP_STYLES[chip.color]
              )}
              style={{
                left: `calc(50% + ${chip.x}px - 18px)`,
                top: `calc(50% + ${chip.y}px - 18px)`,
              }}
            >
              {chip.label}
            </div>
          ))}
        </div>
      </div>

      <div
        className="absolute inset-x-8 bottom-8 z-10 h-[110px] flex flex-col justify-between rounded-[22px] border bg-white/5 p-4 shadow-2xl backdrop-blur-2xl"
        style={{ borderColor: "rgba(255, 255, 255, 0.3)" }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex items-center">
            <div
              className="h-7 w-7 rounded-full border shrink-0"
              style={{ borderColor: "rgba(255, 255, 255, 0.85)" }}
            />
            <div
              className="-ml-4 flex h-7 items-center justify-center rounded-full border pl-6 pr-4 text-[11px] font-medium text-white"
              style={{ borderColor: "rgba(255, 255, 255, 0.85)" }}
            >
              {slide.title}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => go(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border text-white outline-none transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-0"
              style={{ borderColor: "rgba(255, 255, 255, 0.85)" }}
            >
              <ArrowDownLeft className="h-3.5 w-3.5 text-white" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Próximo"
              onClick={() => go(1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border text-white outline-none transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-0"
              style={{ borderColor: "rgba(255, 255, 255, 0.85)" }}
            >
              <ArrowUpRight className="h-3.5 w-3.5 text-white" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <p className="line-clamp-2 text-[11px] font-normal leading-relaxed text-white/80">
          {slide.caption}
        </p>
      </div>
    </div>
  );
}
