"use client";

import Link from "next/link";
import { ShieldCheck, ArrowRight, ArrowUpRight, FolderOpen, ImageIcon, Lock, Code2, Link2 } from "lucide-react";
import { motion } from "motion/react";

/* ─── Header ──────────────────────────────────────────────── */

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#1E1B2E]/10 bg-[#F4EFE8]/85 px-6 backdrop-blur-md lg:px-10">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
          style={{ background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)" }}
        >
          <ShieldCheck className="h-4 w-4" />
        </div>
        <span className="font-serif text-xl font-normal tracking-tight text-[#1E1B2E]">Vault</span>
      </Link>

      {/* Nav */}
      <nav className="hidden items-center gap-7 text-sm font-medium text-[#1E1B2E]/55 md:flex">
        <a href="#features" className="transition-colors hover:text-[#1E1B2E]">Recursos</a>
        <a href="#security" className="transition-colors hover:text-[#1E1B2E]">Segurança</a>
        <a href="#pricing" className="transition-colors hover:text-[#1E1B2E]">Planos</a>
        <a href="#faq" className="transition-colors hover:text-[#1E1B2E]">FAQ</a>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="hidden text-sm font-medium text-[#1E1B2E]/55 transition-colors hover:text-[#1E1B2E] sm:block"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-[#1E1B2E] px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[#3B2F5E]"
        >
          Criar conta grátis
        </Link>
      </div>
    </header>
  );
}

/* ─── Hero ────────────────────────────────────────────────── */

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-0 pt-14 lg:px-10 lg:pt-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_440px]">

        {/* LEFT — copy */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col"
        >
          {/* Eyebrow */}
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#7C3AED]/20 bg-[#7C3AED]/8 px-3.5 py-1 text-[11px] font-semibold tracking-wide text-[#7C3AED]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
            AES-256-GCM · Organização estilo Drive
          </span>

          {/* Headline — Playfair Display, bold for dramatic thick-thin contrast */}
          <h1 className="font-serif mt-6 text-[clamp(3.2rem,6.5vw,5.2rem)] font-bold leading-none tracking-tight text-[#1E1B2E]">
            Tudo o que importa,<br />
            em um só{" "}
            <em className="italic" style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              cofre.
            </em>
          </h1>

          {/* Sub */}
          <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-[#1E1B2E]/50 sm:text-lg">
            Imagens, PDFs, notas, snippets, links e senhas — organizados
            em pastas que você já conhece. Arraste, solte e encontre
            qualquer coisa em segundos.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-full bg-[#7C3AED] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:bg-[#6D28D9] hover:shadow-violet-500/35 active:scale-[0.98]"
            >
              Começar de graça
            </Link>
            <Link
              href="/register"
              aria-label="Criar conta"
              className="group flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#1E1B2E] transition-all hover:bg-[#1E1B2E]"
            >
              <ArrowRight className="h-4 w-4 text-[#1E1B2E] transition-colors group-hover:text-white" />
            </Link>
          </div>

          {/* Micro trust */}
          <p className="mt-4 text-[11px] font-medium text-[#1E1B2E]/35">
            Sem cartão de crédito · 500 MB grátis para sempre
          </p>
        </motion.div>

        {/* RIGHT — visual card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="relative"
        >
          <VaultVisualCard />
        </motion.div>
      </div>

      {/* Marquee */}
      <LogoMarquee />
    </section>
  );
}

/* ─── Vault Visual Card ───────────────────────────────────── */

function VaultVisualCard() {
  return (
    <div className="relative">
      {/* Main card */}
      <div
        className="relative w-full overflow-hidden rounded-[28px]"
        style={{
          background: "linear-gradient(145deg, #9333EA 0%, #6D28D9 55%, #4C1D95 100%)",
          minHeight: 420,
        }}
      >
        {/* Top noise/texture overlay for depth */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px",
          }}
        />

        {/* Radial light */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 35% 25%, rgba(216,180,254,0.35) 0%, transparent 65%)",
          }}
        />

        {/* Floating blob + icons */}
        <div className="float-anim absolute inset-0 flex items-center justify-center pb-10">
          <div
            className="blob-morph relative flex h-56 w-56 items-center justify-center"
            style={{
              background: "linear-gradient(145deg, #1E1035 0%, #2E1065 40%, #0D0018 100%)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.12), inset -1px -1px 0 rgba(0,0,0,0.3)",
            }}
          >
            {/* Specular highlight */}
            <div
              className="blob-morph absolute inset-0 opacity-20"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 45%)",
                animationDelay: "-4s",
                animationDuration: "10s",
              }}
            />

            {/* ── Central folder icon ── */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              {/* Pulse ring */}
              <div
                className="absolute h-20 w-20 rounded-full"
                style={{
                  background: "rgba(167,139,250,0.15)",
                  animation: "pulse-ring 2.4s ease-in-out infinite",
                }}
              />
              <div
                className="absolute h-28 w-28 rounded-full"
                style={{
                  background: "rgba(167,139,250,0.07)",
                  animation: "pulse-ring 2.4s ease-in-out 0.6s infinite",
                }}
              />

              {/* Folder */}
              <div
                className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
                  boxShadow: "0 8px 24px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
                  animation: "folder-swing 3.5s ease-in-out infinite",
                }}
              >
                <FolderOpen className="h-7 w-7 text-white" strokeWidth={1.5} />
              </div>

              {/* Label under folder */}
              <span
                className="rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(216,180,254,0.8)" }}
              >
                Meu Vault
              </span>
            </div>

            {/* ── Orbiting mini icons ── */}
            <OrbitIcon icon={<ImageIcon className="h-3.5 w-3.5 text-violet-300" strokeWidth={2} />}
              top="14%" left="68%" delay="0s" duration="3.8s" />
            <OrbitIcon icon={<Lock className="h-3.5 w-3.5 text-pink-300" strokeWidth={2} />}
              top="65%" left="75%" delay="0.9s" duration="4.2s" />
            <OrbitIcon icon={<Code2 className="h-3.5 w-3.5 text-emerald-300" strokeWidth={2} />}
              top="70%" left="12%" delay="1.6s" duration="3.5s" />
            <OrbitIcon icon={<Link2 className="h-3.5 w-3.5 text-sky-300" strokeWidth={2} />}
              top="12%" left="14%" delay="2.3s" duration="4.5s" />
          </div>
        </div>

        {/* Rotating badge */}
        <RotatingBadge />

        {/* Bottom pills */}
        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="rounded-full bg-white/15 px-3.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
              7 tipos de arquivo
            </div>
            <div className="rounded-full bg-[#1E1B2E]/60 px-3.5 py-1.5 text-[11px] font-semibold text-violet-200 backdrop-blur-sm">
              AES-256-GCM
            </div>
          </div>
        </div>

        {/* Top indicator bar */}
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-white/30" />
            <div className="h-2 w-2 rounded-full bg-white/20" />
            <div className="h-2 w-2 rounded-full bg-white/10" />
          </div>
          <div className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/60 backdrop-blur-sm">
            vault.app
          </div>
        </div>
      </div>

      {/* Floating stat card — outside the main card, bottom-right */}
      <div className="absolute -bottom-12 -right-4 rounded-2xl border border-[#1E1B2E]/8 bg-white px-4 py-3 shadow-xl">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1E1B2E]/40">Itens seguros</p>
        <p className="font-serif mt-0.5 text-2xl font-normal text-[#1E1B2E]">
          500 <span className="text-sm text-[#7C3AED]">MB grátis</span>
        </p>
      </div>

      <div className="absolute -top-6 -left-3 flex items-center gap-2 rounded-xl border border-[#1E1B2E]/8 bg-white px-3 py-2 shadow-lg">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#7C3AED]/10">
          <ShieldCheck className="h-3.5 w-3.5 text-[#7C3AED]" />
        </div>
        <span className="text-[11px] font-semibold text-[#1E1B2E]">Cifrado</span>
      </div>
    </div>
  );
}

/* ─── Rotating badge ──────────────────────────────────────── */

function RotatingBadge() {
  const text = "Cofre Digital · Vault Seguro · ";
  const chars = text.split("");
  const radius = 44;

  return (
    <div className="absolute bottom-10 right-8 h-24 w-24">
      <svg
        viewBox="0 0 100 100"
        className="spin-slow absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <path
            id="badge-path"
            d={`M 50,50 m -${radius},0 a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 -${radius * 2},0`}
          />
        </defs>
        <text
          className="fill-white/75"
          fontSize="10"
          fontWeight="600"
          letterSpacing="2.5"
          fontFamily="var(--font-inter)"
        >
          <textPath href="#badge-path">{chars.join("")}</textPath>
        </text>
      </svg>
      {/* Arrow center */}
      <div className="absolute inset-[16px] flex items-center justify-center rounded-full border border-white/25 bg-white/12 backdrop-blur-sm">
        <ArrowUpRight className="h-5 w-5 text-white" strokeWidth={2} />
      </div>
    </div>
  );
}

/* ─── Orbit Icon (mini floating pills inside blob) ───────── */

function OrbitIcon({
  icon,
  top,
  left,
  delay,
  duration,
}: {
  icon: React.ReactNode;
  top: string;
  left: string;
  delay: string;
  duration: string;
}) {
  return (
    <div
      className="absolute flex items-center justify-center rounded-xl"
      style={{
        top,
        left,
        width: 28,
        height: 28,
        background: "rgba(255,255,255,0.10)",
        backdropFilter: "blur(6px)",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        animation: `float ${duration} ease-in-out ${delay} infinite`,
      }}
    >
      {icon}
    </div>
  );
}

/* ─── Logo Marquee ────────────────────────────────────────── */

const BRANDS = [
  "Next.js", "Prisma", "PostgreSQL", "AES-256", "Cloudinary",
  "Stripe", "NextAuth", "Radix UI", "Monaco Editor", "Zustand",
];

function LogoMarquee() {
  const doubled = [...BRANDS, ...BRANDS];

  return (
    <div className="relative mt-16 overflow-hidden border-y border-[#1E1B2E]/10 py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24"
        style={{ background: "linear-gradient(to right, #F4EFE8, transparent)" }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24"
        style={{ background: "linear-gradient(to left, #F4EFE8, transparent)" }} />

      <div className="flex w-max">
        <div className="marquee-track flex shrink-0 items-center">
          {doubled.map((brand, i) => (
            <span key={i} className="flex shrink-0 items-center">
              <span className="px-8 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1E1B2E]/30">
                {brand}
              </span>
              <span className="h-3.5 w-px bg-[#1E1B2E]/12" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
