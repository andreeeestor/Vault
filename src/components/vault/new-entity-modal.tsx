"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, StickyNote, Code2, Link2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useVaultStore } from "@/lib/vault-store";
import { SNIPPET_LANGUAGES, languageLabel } from "@/lib/monaco-theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NewEntityModalProps {
  open: boolean;
  onClose: () => void;
  kind: "note" | "snippet" | "link" | "folder";
}

export function NewEntityModal({ open, onClose, kind }: NewEntityModalProps) {
  const router = useRouter();
  const currentFolderId = useVaultStore((s) => s.currentFolderId);
  const createNote = useVaultStore((s) => s.createNote);
  const createSnippet = useVaultStore((s) => s.createSnippet);
  const createLink = useVaultStore((s) => s.createLink);
  const createFolder = useVaultStore((s) => s.createFolder);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isPending, startTransition] = useTransition();

  const getFolderIdForDb = () => {
    return currentFolderId === "root" ? null : currentFolderId;
  };

  const handleCreate = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error("Informe um nome para continuar.");
      return;
    }

    startTransition(async () => {
      try {
        if (kind === "note") {
          const item = await createNote(trimmedTitle, getFolderIdForDb());
          toast.success("Nota criada com sucesso!");
          router.push(`/vault/item/${item.id}`);
          handleClose();
        } else if (kind === "snippet") {
          const item = await createSnippet(trimmedTitle, getFolderIdForDb(), language);
          toast.success("Snippet criado com sucesso!");
          router.push(`/vault/item/${item.id}`);
          handleClose();
        } else if (kind === "link") {
          if (!url.trim()) {
            toast.error("Informe a URL do link.");
            return;
          }
          const parsedUrl = url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`;
          const item = await createLink(trimmedTitle, getFolderIdForDb(), parsedUrl);
          toast.success("Link adicionado com sucesso!");
          router.push(`/vault/item/${item.id}`);
          handleClose();
        } else if (kind === "folder") {
          const folder = await createFolder(trimmedTitle, currentFolderId);
          toast.success(`Pasta "${folder.name}" criada!`);
          router.push(`/vault/folder/${folder.id}`);
          handleClose();
        }
      } catch (err) {
        console.error(err);
        toast.error("Erro ao criar item. Tente novamente.");
      }
    });
  };

  const handleClose = () => {
    setTitle("");
    setUrl("");
    setLanguage("javascript");
    onClose();
  };

  const icons = {
    note: StickyNote,
    snippet: Code2,
    link: Link2,
    folder: FolderPlus,
  };

  const Icon = icons[kind];

  const labels = {
    note: {
      title: "Nova nota",
      desc: "Crie uma nova nota formatada em markdown",
      inputLabel: "Título da nota",
      placeholder: "Minhas ideias, Roteiro de viagem...",
    },
    snippet: {
      title: "Novo snippet",
      desc: "Guarde um bloco de código com destaque de sintaxe",
      inputLabel: "Nome do arquivo",
      placeholder: "utils.js, styles.css, query.sql...",
    },
    link: {
      title: "Novo link",
      desc: "Salve um endereço da web com pré-visualização automática",
      inputLabel: "Título do link",
      placeholder: "Google, Meu portfólio, Documentação...",
    },
    folder: {
      title: "Nova pasta",
      desc: "Organize seus arquivos e notas dentro do cofre",
      inputLabel: "Nome da pasta",
      placeholder: "Trabalho, Projetos, Estudos...",
    },
  };

  const config = labels[kind];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent showClose={false} className="p-0 overflow-hidden max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-heading text-base font-semibold text-[var(--foreground)]">
              {config.title}
            </h2>
            <p className="text-xs text-[var(--foreground-subtle)] mt-0.5">
              {config.desc}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
          >
            ✕
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-[var(--foreground)]">
              {config.inputLabel} <span className="text-[var(--danger)]">*</span>
            </label>
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={config.placeholder}
              className="mt-1.5"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>

          {kind === "link" && (
            <div>
              <label className="text-sm font-medium text-[var(--foreground)]">
                Endereço URL <span className="text-[var(--danger)]">*</span>
              </label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemplo.com"
                className="mt-1.5"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
          )}

          {kind === "snippet" && (
            <div>
              <label className="text-sm font-medium text-[var(--foreground)]">
                Linguagem de sintaxe
              </label>
              <div className="mt-1.5">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none hover:bg-[var(--surface-hover)]">
                    {languageLabel(language)}
                    <span className="text-xs text-[var(--foreground-subtle)]">▼</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[380px] max-h-60 overflow-y-auto">
                    {SNIPPET_LANGUAGES.map((lang) => (
                      <DropdownMenuItem key={lang.id} onSelect={() => setLanguage(lang.id)}>
                        {lang.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}

          <Button onClick={handleCreate} disabled={isPending} className="w-full mt-2">
            <Plus className="h-4 w-4" />
            {isPending ? "Criando…" : "Criar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
