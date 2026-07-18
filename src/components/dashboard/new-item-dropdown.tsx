"use client";

import { Plus, Upload, StickyNote, Code2, Link2, KeyRound, FolderPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function NewItemDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> Novo
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px]">
        <DropdownMenuItem onSelect={() => toast("Abrindo seletor de arquivo…")}>
          <Upload className="h-4 w-4" /> Upload de arquivo
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast("Nova nota criada")}>
          <StickyNote className="h-4 w-4" /> Nova nota
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast("Novo snippet criado")}>
          <Code2 className="h-4 w-4" /> Novo snippet
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast("Novo link — cole a URL")}>
          <Link2 className="h-4 w-4" /> Novo link
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast("Informe sua senha mestra para continuar")}>
          <KeyRound className="h-4 w-4" /> Nova senha
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => toast("Nova pasta criada")}>
          <FolderPlus className="h-4 w-4" /> Nova pasta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
