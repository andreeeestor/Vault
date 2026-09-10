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
  Link,
  Link2Off,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus,
  Plus,
  Download,
  FileText,
  FileDown,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useVaultStore } from "@/lib/vault-store";
import { cn } from "@/lib/utils";
import type { VaultItem } from "@/types";
import { exportToDocx, exportToPdf } from "@/lib/export-document";

// --- Image compression ---
async function compressImageFile(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
          else { width = Math.round((width * maxHeight) / height); height = maxHeight; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(event.target?.result as string); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", quality));
      };
      img.onerror = () => resolve(event.target?.result as string);
    };
    reader.onerror = (err) => reject(err);
  });
}

const BLOCK_TAGS = [
  { label: "Parágrafo", value: "p" },
  { label: "Título 1", value: "h1" },
  { label: "Título 2", value: "h2" },
  { label: "Título 3", value: "h3" },
];

export function DocumentEditor({ item }: { item: VaultItem }) {
  const updateItem = useVaultStore((s) => s.updateItem);
  const markTabDirty = useVaultStore((s) => s.markTabDirty);
  const markTabClean = useVaultStore((s) => s.markTabClean);

  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const isEditorFocusedRef = useRef(false);
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef<string | null>(null);

  const [content, setContent] = useState(item.noteContent ?? "");
  const [lastSavedContent, setLastSavedContent] = useState(item.noteContent ?? "");
  const [fontSize, setFontSize] = useState(14);
  const [blockTag, setBlockTag] = useState("p");
  const [toolbarState, setToolbarState] = useState({
    bold: false, italic: false, underline: false, strikeThrough: false,
    justifyLeft: true, justifyCenter: false, justifyRight: false, justifyFull: false,
  });
  const [linkMode, setLinkMode] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const isDirty = content !== lastSavedContent;

  useEffect(() => { if (isDirty) markTabDirty(item.id); else markTabClean(item.id); }, [isDirty, item.id, markTabDirty, markTabClean]);
  useEffect(() => { return () => markTabClean(item.id); }, [item.id]);

  useEffect(() => {
    if (!editorRef.current || item.noteContent === undefined) return;
    // Never overwrite the DOM while the user is actively typing (would reset
    // the caret and delete characters mid-keystroke).
    if (isEditorFocusedRef.current) return;
    const cleaned = (item.noteContent ?? "").replace(/<img[^>]*src=['"]blob:[^'"]*['"][^>]*>/gi, "");
    if (editorRef.current.innerHTML !== cleaned) editorRef.current.innerHTML = cleaned;
  }, [item.noteContent]);

  // ─── Serialized autosave ────────────────────────────────────────────────
  // Only one DB write is in flight at a time, coalescing pending saves so a
  // stale snapshot never overwrites characters typed while saving.
  const flushSave = useCallback(() => {
    if (isSavingRef.current || pendingSaveRef.current === null) return;
    const html = pendingSaveRef.current;
    pendingSaveRef.current = null;
    isSavingRef.current = true;
    startTransition(async () => {
      try {
        await updateNoteContent(item.id, html);
      } catch {
        toast.error("Erro ao salvar documento.");
      } finally {
        isSavingRef.current = false;
        // Only mark as saved (and sync the store) if the saved snapshot is
        // still what's in the editor.
        if (editorRef.current && editorRef.current.innerHTML === html) {
          updateItem(item.id, { noteContent: html });
          setLastSavedContent(html);
        }
        if (pendingSaveRef.current !== null) flushSave();
      }
    });
  }, [item.id, updateItem]);

  const requestSave = useCallback(
    (html: string) => {
      pendingSaveRef.current = html;
      flushSave();
    },
    [flushSave]
  );

  // Manual save always saves the *current* editor DOM, never a stale snapshot.
  const doSave = useCallback(
    (html?: string) => {
      const next = html ?? editorRef.current?.innerHTML ?? "";
      if (next.length > 0) requestSave(next);
    },
    [requestSave]
  );

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    setContent(html);
    updateItem(item.id, { noteContent: html });
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => requestSave(html), 1500);
  }, [item.id, updateItem, requestSave]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (editorRef.current) doSave(editorRef.current.innerHTML);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [doSave]);

  const updateToolbarState = useCallback(() => {
    setToolbarState({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      justifyLeft: document.queryCommandState("justifyLeft"),
      justifyCenter: document.queryCommandState("justifyCenter"),
      justifyRight: document.queryCommandState("justifyRight"),
      justifyFull: document.queryCommandState("justifyFull"),
    });
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.getRangeAt(0).startContainer;
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = (node as Element).tagName.toLowerCase();
          if (["h1","h2","h3","blockquote"].includes(tag)) { setBlockTag(tag); return; }
        }
        node = node.parentNode;
      }
      setBlockTag("p");
    }
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", updateToolbarState);
    return () => document.removeEventListener("selectionchange", updateToolbarState);
  }, [updateToolbarState]);

  const execFormat = useCallback((cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    handleInput();
    updateToolbarState();
  }, [handleInput, updateToolbarState]);

  const execBlock = useCallback((tag: string) => {
    editorRef.current?.focus();
    document.execCommand("formatBlock", false, tag);
    setBlockTag(tag);
    handleInput();
  }, [handleInput]);

  const changeFontSize = useCallback((delta: number) => {
    setFontSize(prev => Math.max(8, Math.min(72, prev + delta)));
  }, []);

  const insertImageHtml = useCallback((src: string, alt = "Imagem") => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const imgHtml = `<img src="${src}" alt="${alt}" style="max-width:100%;height:auto;border-radius:6px;margin:10px 0;display:block;box-shadow:0 2px 8px rgba(0,0,0,0.12);" /><p><br></p>`;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const temp = document.createElement("div");
      temp.innerHTML = imgHtml;
      const frag = document.createDocumentFragment();
      let child: Node | null;
      let lastNode: Node | null = null;
      while ((child = temp.firstChild)) { lastNode = frag.appendChild(child); }
      range.insertNode(frag);
      if (lastNode) { range.setStartAfter(lastNode); range.collapse(true); sel.removeAllRanges(); sel.addRange(range); }
    } else {
      editorRef.current.innerHTML += imgHtml;
    }
    handleInput();
  }, [handleInput]);

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((it) => it.type.startsWith("image/"));
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (!file) return;
      try { const dataUrl = await compressImageFile(file); insertImageHtml(dataUrl, file.name); }
      catch { toast.error("Erro ao colar imagem."); }
    }
  }, [insertImageHtml]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    const files = Array.from(e.dataTransfer.files);
    const imgFile = files.find((f) => f.type.startsWith("image/"));
    if (imgFile) {
      e.preventDefault();
      try { const dataUrl = await compressImageFile(imgFile); insertImageHtml(dataUrl, imgFile.name); }
      catch { toast.error("Erro ao inserir imagem."); }
    }
  }, [insertImageHtml]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { const dataUrl = await compressImageFile(file); insertImageHtml(dataUrl, file.name); }
    catch { toast.error("Erro ao selecionar imagem."); }
    e.target.value = "";
  };

  const handleLinkClick = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    setLinkMode(true);
    setTimeout(() => linkInputRef.current?.focus(), 30);
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;
    const sel = window.getSelection();
    if (savedRangeRef.current && sel) { sel.removeAllRanges(); sel.addRange(savedRangeRef.current); }
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    document.execCommand("createLink", false, url);
    setLinkMode(false);
    setLinkUrl("");
    handleInput();
  };

  // Tab indenta o texto (ou o item de lista) em vez de tirar o foco do editor.
  // Shift+Tab remove a indentação / remove o aninhamento da lista.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Tab") return;
      e.preventDefault();
      const sel = window.getSelection();
      const startNode =
        sel && sel.rangeCount > 0 ? sel.getRangeAt(0).startContainer : null;
      const listEl =
        startNode instanceof Element
          ? startNode.closest("li")
          : startNode?.parentElement?.closest("li") ?? null;
      if (listEl) {
        document.execCommand(e.shiftKey ? "outdent" : "indent");
      } else if (!e.shiftKey) {
        document.execCommand("insertHTML", false, "&nbsp;&nbsp;&nbsp;&nbsp;");
      } else {
        document.execCommand("outdent");
      }
      handleInput();
    },
    [handleInput]
  );

  const handleExportDocx = useCallback(() => {
    if (!editorRef.current) return;
    exportToDocx(item.title, editorRef.current.innerHTML);
    toast.success("Exportado como Word (.docx)");
  }, [item.title]);

  const handleExportPdf = useCallback(() => {
    if (!editorRef.current) return;
    exportToPdf(item.title, editorRef.current.innerHTML);
  }, [item.title]);

  const blockLabel = BLOCK_TAGS.find((b) => b.value === blockTag)?.label ?? "Parágrafo";

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full flex-col overflow-hidden bg-[#f0f0f0] dark:bg-[#1a1a1e]">
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

        {/* Toolbar wrapper */}
        <div className="shrink-0 border-b border-[var(--border)] bg-[var(--surface)] shadow-sm">
          {/* Status row */}
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-1.5">
            <div className="flex items-center gap-3">
              {isPending ? (
                <span className="flex items-center gap-1.5 text-[11px] text-[var(--foreground-subtle)]">
                  <Loader2 className="h-3 w-3 animate-spin" /> Salvando…
                </span>
              ) : isDirty ? (
                <span className="flex items-center gap-1.5 text-[11px] text-amber-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> Alterações pendentes
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[11px] text-[var(--success)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" /> Salvo
                </span>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2 py-1 text-[11px] font-medium text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-hover)] outline-none cursor-pointer">
                  <Download className="h-3 w-3" /> Exportar
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[170px]">
                <DropdownMenuItem onSelect={handleExportPdf} className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-rose-500" /> PDF (.pdf)
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleExportDocx} className="flex items-center gap-2">
                  <FileDown className="h-3.5 w-3.5 text-blue-500" /> Word (.docx)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Formatting row */}
          {linkMode ? (
            <form onSubmit={handleLinkSubmit} className="flex items-center gap-2 px-4 py-2">
              <Link className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
              <input
                ref={linkInputRef}
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://exemplo.com"
                className="flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-subtle)]"
                onKeyDown={(e) => { if (e.key === "Escape") { setLinkMode(false); setLinkUrl(""); } }}
              />
              <button type="submit" className="rounded-md bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-white hover:bg-[var(--primary-hover)]">OK</button>
              <button type="button" onClick={() => { setLinkMode(false); setLinkUrl(""); }} className="rounded-md px-2 py-1 text-xs text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]">Cancelar</button>
            </form>
          ) : (
            <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5" onMouseDown={(e) => e.preventDefault()}>
              <TBtn icon={<Undo2 className="h-3.5 w-3.5" />} label="Desfazer (⌘Z)" active={false} onClick={() => execFormat("undo")} />
              <TBtn icon={<Redo2 className="h-3.5 w-3.5" />} label="Refazer (⌘Y)" active={false} onClick={() => execFormat("redo")} />
              <Divider />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-7 min-w-[110px] cursor-pointer items-center justify-between gap-1 rounded-md border border-[var(--border)] px-2 text-xs text-[var(--foreground)] hover:bg-[var(--surface-hover)] outline-none">
                    {blockLabel} <ChevronDown className="h-3 w-3 text-[var(--foreground-subtle)]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[150px]">
                  {BLOCK_TAGS.map((b) => (
                    <DropdownMenuItem key={b.value} onSelect={() => execBlock(b.value)} className={cn(blockTag === b.value && "font-semibold text-[var(--primary)]")}>{b.label}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Divider />
              <div className="flex items-center gap-0.5">
                <TBtn icon={<Minus className="h-3 w-3" />} label="Diminuir tamanho" active={false} onClick={() => changeFontSize(-2)} />
                <span className="w-8 text-center text-xs text-[var(--foreground)]">{fontSize}</span>
                <TBtn icon={<Plus className="h-3 w-3" />} label="Aumentar tamanho" active={false} onClick={() => changeFontSize(2)} />
              </div>
              <Divider />
              <TBtn icon={<Bold className="h-3.5 w-3.5" />} label="Negrito (⌘B)" active={toolbarState.bold} onClick={() => execFormat("bold")} />
              <TBtn icon={<Italic className="h-3.5 w-3.5" />} label="Itálico (⌘I)" active={toolbarState.italic} onClick={() => execFormat("italic")} />
              <TBtn icon={<Underline className="h-3.5 w-3.5" />} label="Sublinhado (⌘U)" active={toolbarState.underline} onClick={() => execFormat("underline")} />
              <TBtn icon={<Strikethrough className="h-3.5 w-3.5" />} label="Tachado" active={toolbarState.strikeThrough} onClick={() => execFormat("strikeThrough")} />
              <Divider />
              <TBtn icon={<Heading1 className="h-3.5 w-3.5" />} label="Título 1" active={blockTag === "h1"} onClick={() => execBlock("h1")} />
              <TBtn icon={<Heading2 className="h-3.5 w-3.5" />} label="Título 2" active={blockTag === "h2"} onClick={() => execBlock("h2")} />
              <TBtn icon={<Heading3 className="h-3.5 w-3.5" />} label="Título 3" active={blockTag === "h3"} onClick={() => execBlock("h3")} />
              <Divider />
              <TBtn icon={<List className="h-3.5 w-3.5" />} label="Lista" active={false} onClick={() => execFormat("insertUnorderedList")} />
              <TBtn icon={<ListOrdered className="h-3.5 w-3.5" />} label="Lista numerada" active={false} onClick={() => execFormat("insertOrderedList")} />
              <TBtn icon={<Quote className="h-3.5 w-3.5" />} label="Citação" active={blockTag === "blockquote"} onClick={() => execBlock("blockquote")} />
              <Divider />
              <TBtn icon={<AlignLeft className="h-3.5 w-3.5" />} label="Alinhar à esquerda" active={toolbarState.justifyLeft} onClick={() => execFormat("justifyLeft")} />
              <TBtn icon={<AlignCenter className="h-3.5 w-3.5" />} label="Centralizar" active={toolbarState.justifyCenter} onClick={() => execFormat("justifyCenter")} />
              <TBtn icon={<AlignRight className="h-3.5 w-3.5" />} label="Alinhar à direita" active={toolbarState.justifyRight} onClick={() => execFormat("justifyRight")} />
              <TBtn icon={<AlignJustify className="h-3.5 w-3.5" />} label="Justificar" active={toolbarState.justifyFull} onClick={() => execFormat("justifyFull")} />
              <Divider />
              <TBtn icon={<Link className="h-3.5 w-3.5" />} label="Inserir link" active={false} onClick={handleLinkClick} />
              <TBtn icon={<Link2Off className="h-3.5 w-3.5" />} label="Remover link" active={false} onClick={() => execFormat("unlink")} />
              <TBtn icon={<ImageIcon className="h-3.5 w-3.5 text-[var(--primary)]" />} label="Inserir imagem" active={false} onClick={() => imageInputRef.current?.click()} />
            </div>
          )}
        </div>

        {/* Paper area */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div
            className="mx-auto w-full max-w-[816px] min-h-[1056px] rounded-sm bg-white dark:bg-[#242428] shadow-[0_1px_4px_rgba(0,0,0,0.12),0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.4),0_4px_20px_rgba(0,0,0,0.3)]"
            style={{ padding: "72px 80px" }}
          >
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onFocus={() => {
                isEditorFocusedRef.current = true;
              }}
              onBlur={() => {
                isEditorFocusedRef.current = false;
              }}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onDrop={handleDrop}
              spellCheck
              className="prose-doc min-h-full outline-none"
              style={{ fontSize: `${fontSize}px`, lineHeight: "1.75", color: "inherit" }}
              data-placeholder="Comece a escrever seu documento…"
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function TBtn({ icon, label, active, onClick }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onMouseDown={(e) => { e.preventDefault(); onClick(); }}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
            active
              ? "bg-[var(--primary)] text-white"
              : "text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
          )}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-[var(--border)]" />;
}
