import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number | bigint): string {
  const n = typeof bytes === "bigint" ? Number(bytes) : bytes;
  if (n === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(1024));
  const value = n / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatRelativeDate(dateInput: Date | string): string {
  const date = new Date(dateInput);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffHour < 24) return `há ${diffHour} h`;
  if (diffDay === 1) return "ontem";
  if (diffDay < 7) return `há ${diffDay} dias`;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: diffDay > 365 ? "numeric" : undefined,
  }).format(date);
}

export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

export const LABEL_COLORS = [
  { id: "violet", hex: "#7C3AED", name: "Violeta" },
  { id: "rose", hex: "#E11D48", name: "Rosa" },
  { id: "amber", hex: "#D97706", name: "Âmbar" },
  { id: "emerald", hex: "#059669", name: "Esmeralda" },
  { id: "sky", hex: "#0284C7", name: "Céu" },
  { id: "stone", hex: "#57534E", name: "Pedra" },
] as const;

export function labelColorHex(id: string | null | undefined): string {
  if (id && id.startsWith("#")) return id;
  return LABEL_COLORS.find((c) => c.id === id)?.hex ?? LABEL_COLORS[0].hex;
}
