"use client";

import { LogOut, Settings, CreditCard, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export function UserDropdown({
  name,
  email,
  image,
}: {
  name: string;
  email: string;
  image: string | null;
}) {
  const router = useRouter();
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
        {image ? (
          
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-xs font-semibold text-white"
            style={{ background: "var(--gradient-brand)" }}
          >
            {initials}
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex flex-col gap-0.5 px-2.5 py-1.5">
          <span className="text-sm font-medium text-[var(--foreground)]">{name}</span>
          <span className="text-xs text-[var(--foreground-subtle)]">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/settings/profile")}>
          <Settings className="h-4 w-4" /> Configurações
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/settings/billing")}>
          <CreditCard className="h-4 w-4" /> Planos e faturamento
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/settings/billing")}>
          <Sparkles className="h-4 w-4" /> Atualizar plano
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => router.push("/login")}>
          <LogOut className="h-4 w-4" /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
