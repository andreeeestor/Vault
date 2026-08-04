"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Save, Loader2, CheckCircle2 } from "lucide-react";
import type { VaultItem } from "@/types";
import { updateDiagramData } from "@/actions/items";
import { useVaultStore } from "@/lib/vault-store";

// Excalidraw requires browser APIs — load dynamically with no SSR
const Excalidraw = dynamic(
  async () => {
    const { Excalidraw } = await import("@excalidraw/excalidraw");
    return Excalidraw;
  },
  { ssr: false, loading: () => <DiagramLoading /> }
);

type ExcalidrawAPI = {
  exportToBlob: (opts: { mimeType: string; quality?: number }) => Promise<Blob>;
  getSceneElements: () => readonly unknown[];
  getAppState: () => Record<string, unknown>;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

function DiagramLoading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[var(--background)]">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
        <Loader2 className="h-5 w-5 text-[var(--primary)]" />
      </div>
      <p className="text-sm text-[var(--foreground-muted)]">Carregando editor de diagramas…</p>
    </div>
  );
}

export function DiagramEditor({ item }: { item: VaultItem }) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawAPI | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const updateItem = useVaultStore((s) => s.updateItem);

  // Parse stored diagram data
  const initialData = (() => {
    if (!item.diagramData) return undefined;
    try {
      const parsed = JSON.parse(item.diagramData);
      return {
        elements: parsed.elements ?? [],
        appState: {
          ...(parsed.appState ?? {}),
          // Strip viewport / window-size from stored state
          collaborators: new Map(),
        },
        scrollToContent: true,
      };
    } catch {
      return undefined;
    }
  })();

  // Trigger auto-save with debounce whenever the scene changes
  const scheduleAutoSave = useCallback(() => {
    if (!excalidrawAPI) return;
    setSaveStatus("saving");

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const elements = excalidrawAPI.getSceneElements();
        const appState = excalidrawAPI.getAppState();

        // Persist only serializable state (omit big / non-serializable keys)
        const { collaborators: _c, ...serializableState } = appState as Record<string, unknown>;

        const json = JSON.stringify({ elements, appState: serializableState });
        await updateDiagramData(item.id, json);
        updateItem(item.id, { diagramData: json });
        setSaveStatus("saved");

        // Reset to idle after 2s
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (err) {
        console.error("Erro ao salvar diagrama:", err);
        setSaveStatus("error");
      }
    }, 1000);
  }, [excalidrawAPI, item.id, updateItem]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const handleExportPNG = async () => {
    if (!excalidrawAPI) return;
    try {
      const blob = await excalidrawAPI.exportToBlob({ mimeType: "image/png", quality: 1 });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.title}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao exportar PNG:", err);
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2">
        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Salvando…
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Salvo
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-xs text-red-500">Erro ao salvar</span>
          )}
          {saveStatus === "idle" && excalidrawAPI && (
            <span className="text-xs text-[var(--foreground-subtle)]">Auto-save ativo</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPNG}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-active)] transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar PNG
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1">
        <Excalidraw
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          excalidrawAPI={(api: any) => setExcalidrawAPI(api as ExcalidrawAPI)}
          initialData={initialData}
          onChange={scheduleAutoSave}
          langCode="pt-BR"
          UIOptions={{
            canvasActions: {
              export: false, // We have our own export button
              saveAsImage: false,
            },
          }}
        />
      </div>
    </div>
  );
}
