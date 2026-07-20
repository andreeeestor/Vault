"use client";

import { useState } from "react";
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

export function NewItemDropdown() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [hasMasterPass, setHasMasterPass] = useState(false);

  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [entityKind, setEntityKind] = useState<"note" | "snippet" | "link" | "folder">("note");

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
