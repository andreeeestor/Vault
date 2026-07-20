"use client";

import { useState, useRef } from "react";
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
import { hasMasterPasswordSet } from "@/actions/vault-crypto";
import { NewPasswordModal } from "@/components/vault/new-password-modal";
import { NewEntityModal } from "@/components/vault/new-entity-modal";
import { useVaultStore } from "@/lib/vault-store";
import { mapItem } from "@/lib/mappers";

export function NewItemDropdown() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [hasMasterPass, setHasMasterPass] = useState(false);
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [entityKind, setEntityKind] = useState<"note" | "snippet" | "link" | "folder">("note");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentFolderId = useVaultStore((s) => s.currentFolderId);
  const addItem = useVaultStore((s) => s.addItem);

  const openEntityModal = (kind: "note" | "snippet" | "link" | "folder") => {
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
          <Button size="sm">
            <Plus className="h-4 w-4" /> Novo
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[220px]">
          <DropdownMenuItem onSelect={handleUploadClick}>
            <Upload className="h-4 w-4" /> Upload de arquivo
          </DropdownMenuItem>
          
          <DropdownMenuItem onSelect={() => openEntityModal("note")}>
            <StickyNote className="h-4 w-4" /> Nova nota
          </DropdownMenuItem>
          
          <DropdownMenuItem onSelect={() => openEntityModal("snippet")}>
            <Code2 className="h-4 w-4" /> Novo snippet
          </DropdownMenuItem>
          
          <DropdownMenuItem onSelect={() => openEntityModal("link")}>
            <Link2 className="h-4 w-4" /> Novo link
          </DropdownMenuItem>
          
          <DropdownMenuItem onSelect={handleOpenPasswordModal}>
            <KeyRound className="h-4 w-4" /> Nova senha
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
