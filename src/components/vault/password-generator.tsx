"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

/** Gerador client-side (usa Web Crypto) para pré-visualização; a versão persistida usa lib/crypto.ts no servidor. */
function generateClientSide(options: GeneratorOptions): string {
  let charset = LOWER;
  if (options.uppercase) charset += UPPER;
  if (options.numbers) charset += NUMBERS;
  if (options.symbols) charset += SYMBOLS;

  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => charset[n % charset.length]).join("");
}

export function PasswordGenerator({ onUse }: { onUse?: (password: string) => void }) {
  const [options, setOptions] = useState<GeneratorOptions>({
    length: 16,
    uppercase: true,
    numbers: true,
    symbols: true,
  });
  const [password, setPassword] = useState(() => generateClientSide(options));
  const [copied, setCopied] = useState(false);

  const strength = useMemo(() => assessStrength(password), [password]);

  const regenerate = (next: Partial<GeneratorOptions> = {}) => {
    const merged = { ...options, ...next };
    setOptions(merged);
    setPassword(generateClientSide(merged));
  };

  const copy = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success("Senha copiada — será limpa do clipboard em 30s");
    setTimeout(() => setCopied(false), 2000);
    setTimeout(() => navigator.clipboard.writeText("").catch(() => undefined), 30_000);
  };

  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-[var(--radius-md)] bg-[var(--background-elevated)] px-3 py-2.5 font-mono text-sm text-[var(--foreground)]">
          {password}
        </code>
        <Button variant="secondary" size="icon" onClick={() => regenerate()} aria-label="Gerar nova senha">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={copy} aria-label="Copiar senha">
          {copied ? <Check className="h-4 w-4 text-[var(--success)]" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      <StrengthMeter strength={strength} />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm text-[var(--foreground-muted)]">
          <span>Tamanho</span>
          <span className="tabular-nums text-[var(--foreground)]">{options.length}</span>
        </div>
        <input
          type="range"
          min={8}
          max={48}
          value={options.length}
          onChange={(e) => regenerate({ length: Number(e.target.value) })}
          className="accent-[var(--primary)]"
        />

        {(
          [
            { key: "uppercase" as const, label: "Letras maiúsculas" },
            { key: "numbers" as const, label: "Números" },
            { key: "symbols" as const, label: "Símbolos" },
          ] satisfies { key: keyof GeneratorOptions; label: string }[]
        ).map(({ key, label }) => (
          <label key={key} className="flex items-center justify-between text-sm text-[var(--foreground-muted)]">
            {label}
            <input
              type="checkbox"
              checked={options[key] as boolean}
              onChange={(e) => regenerate({ [key]: e.target.checked } as Partial<GeneratorOptions>)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
          </label>
        ))}
      </div>

      {onUse && (
        <Button onClick={() => onUse(password)} className="w-full">
          Usar esta senha
        </Button>
      )}
    </div>
  );
}

function assessStrength(password: string): "weak" | "medium" | "strong" {
  let classes = 0;
  if (/[a-z]/.test(password)) classes++;
  if (/[A-Z]/.test(password)) classes++;
  if (/[0-9]/.test(password)) classes++;
  if (/[^a-zA-Z0-9]/.test(password)) classes++;
  if (password.length < 8 || classes <= 1) return "weak";
  if (password.length >= 12 && classes >= 3) return "strong";
  return "medium";
}

function StrengthMeter({ strength }: { strength: "weak" | "medium" | "strong" }) {
  const config = {
    weak: { label: "Fraca", color: "var(--danger)", width: "33%" },
    medium: { label: "Média", color: "var(--warning)", width: "66%" },
    strong: { label: "Forte", color: "var(--success)", width: "100%" },
  }[strength];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: config.width, background: config.color }}
        />
      </div>
      <span className="text-xs font-medium" style={{ color: config.color }}>
        Força: {config.label}
      </span>
    </div>
  );
}
