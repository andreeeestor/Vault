"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import type { editor as MonacoEditorNS } from "monaco-editor";
import { Check, ChevronDown, Copy, Loader2, Pencil, Eye } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/providers/theme-provider";
import { useRouter } from "next/navigation";
import { useVaultStore } from "@/lib/vault-store";
import { languageLabel, defineVaultMonacoThemes, SNIPPET_LANGUAGES } from "@/lib/monaco-theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { VaultItem } from "@/types";
import { UnsavedChangesModal } from "@/components/vault/unsaved-changes-modal";
import { updateSnippetContent } from "@/actions/items";

export function SnippetEditor({ item }: { item: VaultItem }) {
  const { theme } = useTheme();
  const router = useRouter();
  const updateItem = useVaultStore((s) => s.updateItem);
  const [isPending, startTransition] = useTransition();

  const [content, setContent] = useState(item.codeContent ?? "");
  const [language, setLanguage] = useState(item.codeLanguage ?? "plaintext");
  const [readOnly, setReadOnly] = useState(true);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null);

  // Controle local para saber se foi salvo
  const [lastSavedContent, setLastSavedContent] = useState(item.codeContent ?? "");
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const isDirty = content !== lastSavedContent;

  // Função de salvamento manual
  const handleSave = useCallback(() => {
    const val = editorRef.current ? editorRef.current.getValue() : content;
    startTransition(async () => {
      try {
        await updateSnippetContent(item.id, val, language);
        updateItem(item.id, { codeContent: val, codeLanguage: language });
        setLastSavedContent(val);
        toast.success("Snippet salvo com sucesso!");
      } catch (err) {
        console.error(err);
        toast.error("Erro ao salvar snippet.");
      }
    });
  }, [content, language, item.id, updateItem]);

  // Ouvir evento customizado da barra lateral
  useEffect(() => {
    const handleSaveEvent = () => handleSave();
    document.addEventListener("vault-save-item", handleSaveEvent);
    return () => document.removeEventListener("vault-save-item", handleSaveEvent);
  }, [handleSave]);

  const handleBeforeMount = useCallback((monaco: Monaco) => {
    defineVaultMonacoThemes(monaco);
  }, []);

  // Bloquear fechamento de aba / recarregamento do browser
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "Você tem alterações não salvas. Tem certeza que deseja sair?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Interceptar cliques em links internos do Next.js
  useEffect(() => {
    if (!isDirty) return;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor) {
        const href = anchor.getAttribute("href");
        if (href && href.startsWith("/") && !href.startsWith("#")) {
          e.preventDefault();
          e.stopPropagation();
          setPendingHref(href);
          setShowExitModal(true);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => document.removeEventListener("click", handleAnchorClick, true);
  }, [isDirty]);

  // Interceptar botão voltar/avançar do navegador
  useEffect(() => {
    if (!isDirty) return;

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      setPendingHref("back");
      setShowExitModal(true);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isDirty]);

  const handleConfirmExit = () => {
    setShowExitModal(false);
    // Zera o estado para permitir a navegação
    setLastSavedContent(content);
    
    if (pendingHref === "back") {
      router.back();
    } else if (pendingHref) {
      router.push(pendingHref);
    }
  };

  const handleMount: OnMount = (editorInstance, monacoInstance) => {
    editorRef.current = editorInstance;
    editorInstance.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS,
      () => {
        handleSave();
      }
    );
  };

  const handleLanguageChange = (nextLanguage: string) => {
    setLanguage(nextLanguage);
    updateItem(item.id, { codeLanguage: nextLanguage });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Snippet copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col bg-[#0C0A0F]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium text-violet-300 outline-none transition-colors hover:bg-white/5">
              {languageLabel(language)}
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
              {SNIPPET_LANGUAGES.map((lang) => (
                <DropdownMenuItem key={lang.id} onSelect={() => handleLanguageChange(lang.id)}>
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <SaveIndicator isDirty={isDirty} isPending={isPending} />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setReadOnly((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
              readOnly ? "text-foreground-subtle hover:bg-white/5" : "bg-violet-500/15 text-violet-300"
            )}
          >
            {readOnly ? <Pencil className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {readOnly ? "Editar" : "Visualizar"}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium text-foreground-subtle transition-colors hover:bg-white/5"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={content}
          theme={theme === "dark" ? "vault-dark" : "vault-light"}
          beforeMount={handleBeforeMount}
          onMount={handleMount}
          onChange={(value) => setContent(value ?? "")}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', Menlo, Consolas, monospace",
            lineNumbers: "on",
            renderLineHighlight: "line",
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            smoothScrolling: true,
            cursorBlinking: "smooth",
            wordWrap: "on",
            automaticLayout: true,
          }}
          loading={
            <div className="flex h-full w-full items-center justify-center text-xs text-foreground-subtle">
              Carregando editor…
            </div>
          }
        />
      </div>

      <UnsavedChangesModal
        open={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleConfirmExit}
      />
    </div>
  );
}

function SaveIndicator({ isDirty, isPending }: { isDirty: boolean; isPending: boolean }) {
  if (isPending) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-white/50">
        <Loader2 className="h-3 w-3 animate-spin text-violet-400" /> Salvando alterações…
      </span>
    );
  }
  if (isDirty) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" /> Alterações pendentes
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Todas as alterações salvas
    </span>
  );
}