"use client";

import { useState, useRef } from "react";
import { Plus, Upload, StickyNote, Code2, Link2, KeyRound, FolderPlus, Mic, FileText, Bell, PenLine, BookText, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { hasMasterPasswordSet } from "@/actions/vault-crypto";
import { NewPasswordModal } from "@/components/vault/new-password-modal";
import { NewEntityModal } from "@/components/vault/new-entity-modal";
import { AudioRecorderModal } from "@/components/vault/audio-recorder-modal";
import { useVaultStore } from "@/lib/vault-store";
import { mapItem } from "@/lib/mappers";

export function NewItemDropdown() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [hasMasterPass, setHasMasterPass] = useState(false);
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [entityKind, setEntityKind] = useState<"note" | "document" | "snippet" | "link" | "folder" | "reminder" | "diagram">("note");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentFolderId = useVaultStore((s) => s.currentFolderId);
  const addItem = useVaultStore((s) => s.addItem);

  const openEntityModal = (kind: "note" | "document" | "snippet" | "link" | "folder" | "reminder" | "diagram") => {
    setEntityKind(kind);
    setIsEntityModalOpen(true);
  };

  const handleOpenPasswordModal = async () => {
    try {
      const isConfigured = await hasMasterPasswordSet();
      setHasMasterPass(isConfigured);
      setIsPasswordModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao verificar senha mestra.");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let type: "IMAGE" | "PDF" | "AUDIO" = "IMAGE";
    if (file.type.startsWith("image/")) {
      type = "IMAGE";
    } else if (file.type.startsWith("audio/")) {
      type = "AUDIO";
    } else if (file.type === "application/pdf") {
      type = "PDF";
    } else {
      toast.error("Formato de arquivo não suportado. Escolha imagens, PDFs ou áudios.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    if (currentFolderId && currentFolderId !== "root") {
      formData.append("folderId", currentFolderId);
    }

    toast.promise(
      (async () => {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          throw new Error("Falha no upload");
        }
        const data = await res.json();
        const item = mapItem(data.item);
        addItem(item);
        return item;
      })(),
      {
        loading: "Fazendo upload do arquivo para o cofre...",
        success: (item) => `Arquivo "${item.title}" enviado com sucesso!`,
        error: "Erro ao enviar arquivo. Verifique sua conexão.",
      }
    );

    e.target.value = "";
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="px-2.5 sm:px-3">
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Novo</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[220px]">
          <DropdownMenuItem onSelect={handleUploadClick}>
            <Upload className="h-4 w-4" /> Upload de arquivo
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => setIsAudioModalOpen(true)}>
            <Mic className="h-4 w-4" /> Gravar novo áudio
          </DropdownMenuItem>
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer">
              <FileText className="h-4 w-4" /> Novo arquivo de texto
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="min-w-[200px]">
              <DropdownMenuItem onSelect={() => openEntityModal("note")} className="flex flex-col items-start gap-0.5 py-2.5">
                <div className="flex items-center gap-2 font-medium">
                  <StickyNote className="h-4 w-4 text-amber-500" /> Nota
                </div>
                <span className="pl-6 text-[11px] text-[var(--foreground-subtle)]">
                  Bloco de notas rápido em Markdown
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openEntityModal("document")} className="flex flex-col items-start gap-0.5 py-2.5">
                <div className="flex items-center gap-2 font-medium">
                  <BookText className="h-4 w-4 text-indigo-500" /> Documento
                </div>
                <span className="pl-6 text-[11px] text-[var(--foreground-subtle)]">
                  Editor rico com toolbar completa
                </span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          <DropdownMenuItem onSelect={() => openEntityModal("snippet")}>
            <Code2 className="h-4 w-4" /> Novo snippet
          </DropdownMenuItem>
          
          <DropdownMenuItem onSelect={() => openEntityModal("link")}>
            <Link2 className="h-4 w-4" /> Novo link
          </DropdownMenuItem>
          
          <DropdownMenuItem onSelect={handleOpenPasswordModal}>
            <KeyRound className="h-4 w-4" /> Nova senha
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => openEntityModal("reminder")}>
            <Bell className="h-4 w-4" /> Novo lembrete
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => openEntityModal("diagram")}>
            <PenLine className="h-4 w-4" /> Novo diagrama
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onSelect={() => openEntityModal("folder")}>
            <FolderPlus className="h-4 w-4" /> Nova pasta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf,audio/*"
      />

      <AudioRecorderModal
        open={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
      />

      {isPasswordModalOpen && (
        <NewPasswordModal
          open={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          hasMasterPassword={hasMasterPass}
        />
      )}

      {isEntityModalOpen && (
        <NewEntityModal
          open={isEntityModalOpen}
          onClose={() => setIsEntityModalOpen(false)}
          kind={entityKind}
        />
      )}
    </>
  );
}
