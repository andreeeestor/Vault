"use client";

import { useState } from "react";
import { Plus, Upload, StickyNote, Code2, Link2, KeyRound, FolderPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useVaultStore } from "@/lib/vault-store";
import { hasMasterPasswordSet } from "@/actions/vault-crypto";
import { NewPasswordModal } from "@/components/vault/new-password-modal";

export function NewItemDropdown() {
  const router = useRouter();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [hasMasterPass, setHasMasterPass] = useState(false);
  
  // Pegamos o ID da pasta aberta e as ações de criação do Zustand
  const currentFolderId = useVaultStore((s) => s.currentFolderId);
  const createNote = useVaultStore((s) => s.createNote);
  const createSnippet = useVaultStore((s) => s.createSnippet);
  const createLink = useVaultStore((s) => s.createLink);
  const createFolder = useVaultStore((s) => s.createFolder);

  // Helper para normalizar o ID da pasta para o banco (banco aceita null para raiz/sem pasta)
  const getFolderIdForDb = () => {
    return currentFolderId === "root" ? null : currentFolderId;
  };

  const handleCreateNote = async () => {
    try {
      const promise = createNote("Nova nota", getFolderIdForDb());
      toast.promise(promise, {
        loading: "Criando nota...",
        success: (item) => {
          router.push(`/vault/item/${item.id}`);
          return "Nota criada com sucesso!";
        },
        error: "Erro ao criar nota."
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSnippet = async () => {
    try {
      const promise = createSnippet("Novo snippet", getFolderIdForDb(), "javascript");
      toast.promise(promise, {
        loading: "Criando snippet...",
        success: (item) => {
          router.push(`/vault/item/${item.id}`);
          return "Snippet criado com sucesso!";
        },
        error: "Erro ao criar snippet."
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateLink = async () => {
    const url = window.prompt("Insira a URL do link (ex: https://google.com):");
    if (!url) return;

    try {
      const parsedUrl = url.startsWith("http") ? url : `https://${url}`;
      // Basicamente extrai o hostname para título inicial
      let domain = "Link";
      try {
        domain = new URL(parsedUrl).hostname;
      } catch (err) {}

      const promise = createLink(domain, getFolderIdForDb(), parsedUrl);
      toast.promise(promise, {
        loading: "Criando link...",
        success: (item) => {
          router.push(`/vault/item/${item.id}`);
          return "Link adicionado com sucesso!";
        },
        error: "Erro ao adicionar link. Verifique se a URL é válida."
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateFolder = async () => {
    const name = window.prompt("Nome da nova pasta:");
    if (!name?.trim()) return;

    try {
      const promise = createFolder(name.trim(), currentFolderId);
      toast.promise(promise, {
        loading: "Criando pasta...",
        success: (folder) => {
          // Navega para a pasta criada
          router.push(`/vault/folder/${folder.id}`);
          return `Pasta "${folder.name}" criada!`;
        },
        error: "Erro ao criar pasta."
      });
    } catch (e) {
      console.error(e);
    }
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm">
            <Plus className="h-4 w-4" /> Novo
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[220px]">
          <DropdownMenuItem onSelect={() => toast("Upload em breve. Configure o Cloudinary primeiro!")}>
            <Upload className="h-4 w-4" /> Upload de arquivo
          </DropdownMenuItem>
          
          <DropdownMenuItem onSelect={handleCreateNote}>
            <StickyNote className="h-4 w-4" /> Nova nota
          </DropdownMenuItem>
          
          <DropdownMenuItem onSelect={handleCreateSnippet}>
            <Code2 className="h-4 w-4" /> Novo snippet
          </DropdownMenuItem>
          
          <DropdownMenuItem onSelect={handleCreateLink}>
            <Link2 className="h-4 w-4" /> Novo link
          </DropdownMenuItem>
          
          <DropdownMenuItem onSelect={handleOpenPasswordModal}>
            <KeyRound className="h-4 w-4" /> Nova senha
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onSelect={handleCreateFolder}>
            <FolderPlus className="h-4 w-4" /> Nova pasta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isPasswordModalOpen && (
        <NewPasswordModal
          open={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          hasMasterPassword={hasMasterPass}
        />
      )}
    </>
  );
}
