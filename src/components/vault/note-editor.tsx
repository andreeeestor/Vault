"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { updateNoteContent } from "@/actions/items";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Link2Off,
  RemoveFormatting,
  Eye,
  Pencil,
  Loader2,
  Check,
  Download,
  AlignLeft,
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { useVaultStore } from "@/lib/vault-store";
import { cn } from "@/lib/utils";
import type { VaultItem } from "@/types";
import { UnsavedChangesModal } from "@/components/vault/unsaved-changes-modal";
import { exportToDocx, exportToPdf } from "@/lib/export-document";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─── Types ─────────────────────────────────────────────────── */

interface ToolbarState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeThrough: boolean;
  blockTag: string; // "P" | "H1" | "H2" | "H3" | "BLOCKQUOTE" | "PRE"
  inList: boolean;
  inOrderedList: boolean;
}

/* ─── NoteEditor (root export) ───────────────────────────────── */

export function NoteEditor({ item }: { item: VaultItem }) {
  const router = useRouter();
  const updateItem = useVaultStore((s) => s.updateItem);
  const editorRef = useRef<HTMLDivElement>(null);

  const [readOnly, setReadOnly] = useState(false);
  const [content, setContent] = useState(item.noteContent ?? "");
  const [wordCount, setWordCount] = useState(0);

  // Controle local para saber se foi salvo
  const [lastSavedContent, setLastSavedContent] = useState(item.noteContent ?? "");
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Toolbar floating state
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    blockTag: "P",
    inList: false,
    inOrderedList: false,
  });

  const [isPending, startTransition] = useTransition();
  const isDirty = content !== lastSavedContent;

  // Função de salvamento manual
  const handleSave = useCallback(() => {
    startTransition(async () => {
      try {
        await updateNoteContent(item.id, content);
        updateItem(item.id, { noteContent: content });
        setLastSavedContent(content);
        toast.success("Nota salva com sucesso!");
      } catch (err) {
        console.error(err);
        toast.error("Erro ao salvar nota.");
      }
    });
  }, [content, item.id, updateItem]);

  // Ouvir evento customizado da barra lateral
  useEffect(() => {
    const handleSaveEvent = () => handleSave();
    document.addEventListener("vault-save-item", handleSaveEvent);
    return () => document.removeEventListener("vault-save-item", handleSaveEvent);
  }, [handleSave]);

  // Inicializa conteúdo uma vez
  useEffect(() => {
    if (editorRef.current && item.noteContent) {
      editorRef.current.innerHTML = item.noteContent;
      recalcWordCount(item.noteContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Word count
  const recalcWordCount = (html: string) => {
    const text = html.replace(/<[^>]*>/g, " ").trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    setWordCount(words);
  };

  // Handle content changes inside contenteditable
  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    setContent(html);
    recalcWordCount(html);
  }, []);

  // Selection change → update toolbar visibility + state
  const handleSelectionChange = useCallback(() => {
    if (readOnly) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setToolbarVisible(false);
      return;
    }

    // Check selection is inside the editor
    const range = sel.getRangeAt(0);
    if (!editorRef.current?.contains(range.commonAncestorContainer)) {
      setToolbarVisible(false);
      return;
    }

    // Position toolbar above the selection
    const rect = range.getBoundingClientRect();
    setToolbarPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 12, // 12px gap above selection
    });

    // Detect current formatting state
    setToolbarState({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      blockTag: detectBlockTag(),
      inList: document.queryCommandState("insertUnorderedList"),
      inOrderedList: document.queryCommandState("insertOrderedList"),
    });

    setToolbarVisible(true);
  }, [readOnly]);

  // Detect current block element tag
  const detectBlockTag = (): string => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return "P";
    let node: Node | null = sel.getRangeAt(0).startContainer;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = (node as Element).tagName;
        if (["H1", "H2", "H3", "BLOCKQUOTE", "PRE"].includes(tag)) return tag;
      }
      node = node.parentNode;
    }
    return "P";
  };

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [handleSelectionChange]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setToolbarVisible(false);
        return;
      }
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      const saved = (action: () => void) => {
        e.preventDefault();
        action();
      };

      if (e.key === "b") saved(() => execFormat("bold"));
      if (e.key === "i") saved(() => execFormat("italic"));
      if (e.key === "u") saved(() => execFormat("underline"));
      if (e.key === "`") saved(() => wrapCode());
      if (e.key === "s") {
        e.preventDefault();
        startTransition(async () => {
          await updateNoteContent(item.id, content);
          updateItem(item.id, { noteContent: content });
          toast.success("Nota salva");
        });
      }
    },
    [content, item.id, updateItem, startTransition]
  );

  // Execute a formatting command (keeps focus in editor)
  const execFormat = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  }, [handleInput]);

  // Wrap selection in <code>
  const wrapCode = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const selectedText = range.toString();
    if (!selectedText) return;
    const code = document.createElement("code");
    code.textContent = selectedText;
    range.deleteContents();
    range.insertNode(code);
    handleInput();
  }, [handleInput]);

  // Toggle block element (heading / blockquote / paragraph)
  const execBlock = useCallback(
    (tag: string) => {
      editorRef.current?.focus();
      const current = detectBlockTag();
      // Toggle off if already the same tag
      const next = current === tag ? "p" : tag.toLowerCase();
      document.execCommand("formatBlock", false, next);
      handleInput();
    },
    [handleInput]
  );

  // Export handlers
  const handleExportMd = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const md = htmlToMarkdown(html);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.title.replace(/[^a-z0-9]/gi, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [item.title]);

  const handleExportDocx = useCallback(() => {
    if (!editorRef.current) return;
    exportToDocx(item.title, editorRef.current.innerHTML);
    toast.success("Documento exportado como Word (.docx)");
  }, [item.title]);

  const handleExportPdf = useCallback(() => {
    if (!editorRef.current) return;
    exportToPdf(item.title, editorRef.current.innerHTML);
  }, [item.title]);

  return (
    <TooltipProvider delayDuration={400}>
      <div className="flex h-full flex-col bg-[var(--background)]">
        {/* ── Static top bar ── */}
        <StaticToolbar
          readOnly={readOnly}
          isDirty={isDirty}
          isPending={isPending}
          wordCount={wordCount}
          onToggleReadOnly={() => setReadOnly((v) => !v)}
          onExportMd={handleExportMd}
          onExportDocx={handleExportDocx}
          onExportPdf={handleExportPdf}
        />

        {/* ── Editable area ── */}
        <div className="flex-1 overflow-y-auto">
          <div
            ref={editorRef}
            id="note-editor-content"
            data-vault-editor
            contentEditable={!readOnly}
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onMouseUp={handleSelectionChange}
            spellCheck
            className={cn(
              "prose-vault mx-auto min-h-full w-full max-w-2xl px-8 py-10 outline-none",
              readOnly && "cursor-default select-text"
            )}
            data-placeholder="Comece a escrever sua nota…"
          />
        </div>

        {/* ── Floating toolbar (portal-like, fixed positioning) ── */}
        {toolbarVisible && !readOnly && (
          <FloatingToolbar
            pos={toolbarPos}
            state={toolbarState}
            onFormat={execFormat}
            onBlock={execBlock}
            onWrapCode={wrapCode}
            onClose={() => setToolbarVisible(false)}
          />
        )}
        {/* ── Unsaved changes confirmation modal ── */}
        <UnsavedChangesModal
          open={showExitModal}
          onClose={() => setShowExitModal(false)}
          onConfirm={handleConfirmExit}
        />
      </div>
    </TooltipProvider>
  );
}

/* ─── Static top bar ─────────────────────────────────────────── */

function StaticToolbar({
  readOnly,
  isDirty,
  isPending,
  wordCount,
  onToggleReadOnly,
  onExportMd,
  onExportDocx,
  onExportPdf,
}: {
  readOnly: boolean;
  isDirty: boolean;
  isPending: boolean;
  wordCount: number;
  onToggleReadOnly: () => void;
  onExportMd: () => void;
  onExportDocx: () => void;
  onExportPdf: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-surface px-5 py-2">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleReadOnly}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
            !readOnly
              ? "text-foreground-muted hover:bg-surface-hover"
              : "bg-(--primary)/10 text-primary"
          )}
        >
          {!readOnly ? (
            <><Pencil className="h-3.5 w-3.5" /> Modo de Edição</>
          ) : (
            <><Eye className="h-3.5 w-3.5" /> Modo Leitura</>
          )}
        </button>

        <SaveIndicator isDirty={isDirty} isPending={isPending} />
      </div>

      {/* Right: word count + export dropdown */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 text-xs text-[var(--foreground-subtle)]">
          <AlignLeft className="h-3 w-3" />
          {wordCount} {wordCount === 1 ? "palavra" : "palavras"}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] outline-none border border-[var(--border)] cursor-pointer">
              <Download className="h-3.5 w-3.5" />
              Exportar
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            <DropdownMenuItem onSelect={onExportPdf}>
              📄 Exportar em PDF (.pdf)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onExportDocx}>
              📝 Exportar em Word (.docx)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onExportMd}>
              📑 Exportar em Markdown (.md)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/* ─── Floating toolbar ───────────────────────────────────────── */

interface FloatingToolbarProps {
  pos: { x: number; y: number };
  state: ToolbarState;
  onFormat: (cmd: string, value?: string) => void;
  onBlock: (tag: string) => void;
  onWrapCode: () => void;
  onClose: () => void;
}

function FloatingToolbar({ pos, state, onFormat, onBlock, onWrapCode }: FloatingToolbarProps) {
  const [linkMode, setLinkMode] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Save selection before entering link input
  const savedRangeRef = useRef<Range | null>(null);

  const handleLinkClick = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
    setLinkMode(true);
    setTimeout(() => linkInputRef.current?.focus(), 30);
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;
    // Restore selection, then create link
    const sel = window.getSelection();
    if (savedRangeRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    document.execCommand("createLink", false, url);
    setLinkMode(false);
    setLinkUrl("");
  };

  const handleUnlink = () => {
    onFormat("unlink");
  };

  // Toolbar style
  const style: React.CSSProperties = {
    position: "fixed",
    left: pos.x,
    top: pos.y,
    transform: "translate(-50%, -100%)",
    zIndex: 9999,
  };

  return (
    <div
      style={style}
      className="flex items-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] shadow-[var(--shadow-lg)] ring-1 ring-black/5"
      onMouseDown={(e) => e.preventDefault()} // prevent blur/deselection
    >
      {linkMode ? (
        /* ── Link input mode ── */
        <form onSubmit={handleLinkSubmit} className="flex items-center gap-1.5 px-3 py-2">
          <Link className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
          <input
            ref={linkInputRef}
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://exemplo.com"
            className="w-52 bg-transparent text-xs text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-subtle)]"
            onKeyDown={(e) => {
              if (e.key === "Escape") { setLinkMode(false); setLinkUrl(""); }
            }}
          />
          <button
            type="submit"
            className="rounded-md bg-[var(--primary)] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[var(--primary-hover)]"
          >
            OK
          </button>
        </form>
      ) : (
        /* ── Full toolbar ── */
        <div className="flex items-center divide-x divide-[var(--border)] px-1 py-1.5">
          {/* Inline formatting */}
          <div className="flex items-center gap-0.5 px-1">
            <TBtn
              icon={<Bold className="h-3.5 w-3.5" />}
              label="Negrito (⌘B)"
              active={state.bold}
              onClick={() => onFormat("bold")}
            />
            <TBtn
              icon={<Italic className="h-3.5 w-3.5" />}
              label="Itálico (⌘I)"
              active={state.italic}
              onClick={() => onFormat("italic")}
            />
            <TBtn
              icon={<Underline className="h-3.5 w-3.5" />}
              label="Sublinhado (⌘U)"
              active={state.underline}
              onClick={() => onFormat("underline")}
            />
            <TBtn
              icon={<Strikethrough className="h-3.5 w-3.5" />}
              label="Tachado"
              active={state.strikeThrough}
              onClick={() => onFormat("strikeThrough")}
            />
          </div>

          {/* Block level */}
          <div className="flex items-center gap-0.5 px-1">
            <TBtn
              icon={<Heading1 className="h-3.5 w-3.5" />}
              label="Título H1"
              active={state.blockTag === "H1"}
              onClick={() => onBlock("H1")}
            />
            <TBtn
              icon={<Heading2 className="h-3.5 w-3.5" />}
              label="Título H2"
              active={state.blockTag === "H2"}
              onClick={() => onBlock("H2")}
            />
            <TBtn
              icon={<Heading3 className="h-3.5 w-3.5" />}
              label="Título H3"
              active={state.blockTag === "H3"}
              onClick={() => onBlock("H3")}
            />
          </div>

          {/* Lists + Quote + Code */}
          <div className="flex items-center gap-0.5 px-1">
            <TBtn
              icon={<List className="h-3.5 w-3.5" />}
              label="Lista bullet"
              active={state.inList}
              onClick={() => onFormat("insertUnorderedList")}
            />
            <TBtn
              icon={<ListOrdered className="h-3.5 w-3.5" />}
              label="Lista numerada"
              active={state.inOrderedList}
              onClick={() => onFormat("insertOrderedList")}
            />
            <TBtn
              icon={<Quote className="h-3.5 w-3.5" />}
              label="Citação"
              active={state.blockTag === "BLOCKQUOTE"}
              onClick={() => onBlock("BLOCKQUOTE")}
            />
            <TBtn
              icon={<Code className="h-3.5 w-3.5" />}
              label="Código inline (⌘`)"
              active={false}
              onClick={onWrapCode}
            />
          </div>

          {/* Link + clear */}
          <div className="flex items-center gap-0.5 px-1">
            <TBtn
              icon={<Link className="h-3.5 w-3.5" />}
              label="Inserir link"
              active={false}
              onClick={handleLinkClick}
            />
            <TBtn
              icon={<Link2Off className="h-3.5 w-3.5" />}
              label="Remover link"
              active={false}
              onClick={handleUnlink}
            />
            <TBtn
              icon={<RemoveFormatting className="h-3.5 w-3.5" />}
              label="Limpar formatação"
              active={false}
              onClick={() => onFormat("removeFormat")}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Toolbar button ─────────────────────────────────────────── */

function TBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onMouseDown={(e) => {
            e.preventDefault(); // don't blur editor
            onClick();
          }}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
            active
              ? "bg-[var(--primary)] text-white"
              : "text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
          )}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

/* ─── Auto-save indicator ────────────────────────────────────── */

/* ─── Save indicator ────────────────────────────────────── */

function SaveIndicator({ isDirty, isPending }: { isDirty: boolean; isPending: boolean }) {
  if (isPending) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-[var(--foreground-subtle)]">
        <Loader2 className="h-3 w-3 animate-spin" /> Salvando alterações…
      </span>
    );
  }
  if (isDirty) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-amber-500">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> Alterações pendentes
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-[var(--success)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" /> Todas as alterações salvas
    </span>
  );
}

/* ─── HTML → Markdown converter (basic) ─────────────────────── */

function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, "> $1\n\n")
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "_$1_")
    .replace(/<i[^>]*>(.*?)<\/i>/gi, "_$1_")
    .replace(/<u[^>]*>(.*?)<\/u>/gi, "$1")
    .replace(/<s[^>]*>(.*?)<\/s>/gi, "~~$1~~")
    .replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<[ou]l[^>]*>/gi, "\n")
    .replace(/<\/[ou]l>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
    .replace(/<div[^>]*>(.*?)<\/div>/gi, "$1\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
