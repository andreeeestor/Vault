"use client";

import { useCallback, useRef, useState } from "react";
import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import type { editor as MonacoEditorNS } from "monaco-editor";
import { Check, ChevronDown, Copy, Loader2, Pencil, Eye } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/providers/theme-provider";
import { useAutoSave } from "@/hooks/use-auto-save";
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

export function SnippetEditor({ item }: { item: VaultItem }) {
  const { theme } = useTheme();
  const updateItem = useVaultStore((s) => s.updateItem);

  const [content, setContent] = useState(item.codeContent ?? "");
  const [language, setLanguage] = useState(item.codeLanguage ?? "plaintext");
  const [readOnly, setReadOnly] = useState(true);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null);

  const status = useAutoSave(content, async (value) => {
    // TODO(produção): trocar por Server Action `updateItemContent(item.id, value)` (src/actions/items.ts)
    updateItem(item.id, { codeContent: value, codeLanguage: language });
  });

  const handleBeforeMount = useCallback((monaco: Monaco) => {
    defineVaultMonacoThemes(monaco);
  }, []);

  const handleMount: OnMount = (editorInstance, monacoInstance) => {
    editorRef.current = editorInstance;
    editorInstance.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS,
      () => {
        updateItem(item.id, { codeContent: editorInstance.getValue(), codeLanguage: language });
        toast.success("Snippet salvo");
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

          <AutoSaveIndicator status={status} />
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
    </div>
  );
}

function AutoSaveIndicator({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "idle") return null;

  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-foreground-subtle">
        <Loader2 className="h-3 w-3 animate-spin" /> Salvando…
      </span>
    );
  }

  if (status === "error") {
    return <span className="text-xs text-danger">Erro ao salvar</span>;
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-success">
      <Check className="h-3 w-3" /> Salvo
    </span>
  );
}