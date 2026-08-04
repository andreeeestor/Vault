"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { VaultItem } from "@/types";
import { updateDiagramData } from "@/actions/items";
import { useVaultStore } from "@/lib/vault-store";

// ─── Tipos mínimos da API do Excalidraw ──────────────────────────────────────
type ExcalidrawAPI = {
  exportToBlob: (opts: { mimeType: string; quality?: number }) => Promise<Blob>;
  getSceneElements: () => readonly unknown[];
  getAppState: () => Record<string, unknown>;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

// ─── Loading state ────────────────────────────────────────────────────────────
function DiagramSkeleton() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        background: "var(--background)",
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "3px solid var(--primary)",
          borderTopColor: "transparent",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p style={{ fontSize: "13px", color: "var(--foreground-muted)", margin: 0 }}>
        Carregando editor de diagramas…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Excalidraw carregado dinamicamente (zero SSR) ───────────────────────────
// Importamos o CSS do Excalidraw junto com o componente para não poluir o bundle global
const ExcalidrawCore = dynamic(
  async () => {
    // Importa o CSS do Excalidraw (ignoramos erro de tipo — o bundler lida com CSS modules)
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("@excalidraw/excalidraw/index.css");
    } catch {
      // Em alguns ambientes o CSS não é importável como módulo — ignorar
    }
    const mod = await import("@excalidraw/excalidraw");
    return mod.Excalidraw;
  },
  { ssr: false }
);

// ─── Componente principal ─────────────────────────────────────────────────────
export function DiagramEditor({ item }: { item: VaultItem }) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawAPI | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const updateItem = useVaultStore((s) => s.updateItem);

  // Faz parse do JSON salvo e retorna dados iniciais para o Excalidraw
  const initialData = useRef((() => {
    if (!item.diagramData) return undefined;
    try {
      const parsed = JSON.parse(item.diagramData);
      return {
        elements: parsed.elements ?? [],
        appState: {
          ...(parsed.appState ?? {}),
          collaborators: new Map(),
          // Remove estado de janela para não quebrar o resize
          width: undefined,
          height: undefined,
        },
        scrollToContent: true,
      };
    } catch {
      return undefined;
    }
  })()).current;

  // Auto-save com debounce de 1.2s
  const scheduleAutoSave = useCallback(() => {
    if (!excalidrawAPI) return;
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      try {
        const elements = excalidrawAPI.getSceneElements();
        const rawState = excalidrawAPI.getAppState();

        // Remove propriedades não-serializáveis e desnecessárias
        const {
          collaborators: _c,
          openMenu: _m,
          openDialog: _d,
          toast: _t,
          ...serializableState
        } = rawState as Record<string, unknown>;

        const json = JSON.stringify({ elements, appState: serializableState });
        await updateDiagramData(item.id, json);
        updateItem(item.id, { diagramData: json });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (err) {
        console.error("Erro ao salvar diagrama:", err);
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    }, 1200);
  }, [excalidrawAPI, item.id, updateItem]);

  useEffect(() => {
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, []);

  const handleExportPNG = useCallback(async () => {
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
  }, [excalidrawAPI, item.title]);

  return (
    // Wrapper absoluto para garantir que ocupa 100% do espaço disponível
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 12px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          flexShrink: 0,
          gap: "8px",
          minHeight: "40px",
        }}
      >
        {/* Status de save */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
          {saveStatus === "saving" && (
            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--foreground-muted)" }}>
              <Loader2 style={{ width: "13px", height: "13px", animation: "spin 1s linear infinite" }} />
              Salvando…
            </span>
          )}
          {saveStatus === "saved" && (
            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#16a34a" }}>
              <CheckCircle2 style={{ width: "13px", height: "13px" }} />
              Salvo
            </span>
          )}
          {saveStatus === "error" && (
            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#dc2626" }}>
              <AlertCircle style={{ width: "13px", height: "13px" }} />
              Erro ao salvar
            </span>
          )}
          {saveStatus === "idle" && isLoaded && (
            <span style={{ fontSize: "12px", color: "var(--foreground-subtle)" }}>
              Edite livremente — auto-save ativo
            </span>
          )}
        </div>

        {/* Ações */}
        <button
          onClick={handleExportPNG}
          disabled={!isLoaded}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 10px",
            fontSize: "12px",
            fontWeight: 500,
            borderRadius: "6px",
            border: "1px solid var(--border)",
            background: "var(--surface-hover)",
            color: "var(--foreground)",
            cursor: isLoaded ? "pointer" : "not-allowed",
            opacity: isLoaded ? 1 : 0.5,
            transition: "background 0.15s",
            flexShrink: 0,
          }}
        >
          <Download style={{ width: "12px", height: "12px" }} />
          Exportar PNG
        </button>
      </div>

      {/* ── Canvas ────────────────────────────────────────────────────── */}
      {/*
        O wrapper do Excalidraw PRECISA de altura explícita em pixels ou position:absolute/relative
        para que o canvas interno compute corretamente o ResizeObserver.
        Usando position:relative + inset:0 resolvemos o problema de ícones gigantes
        (que ocorre quando width/height são 0 no momento da montagem).
      */}
      <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
        {!isLoaded && <DiagramSkeleton />}

        {/* CSS do Excalidraw injetado como <link> para não conflitar com Tailwind */}
        <style>{`
          /* Isola o CSS do Excalidraw apenas dentro do nosso container */
          .excalidraw-wrapper {
            height: 100%;
            width: 100%;
            position: absolute;
            inset: 0;
          }
          .excalidraw-wrapper .excalidraw {
            border-radius: 0 !important;
          }
          /* Corrige ícones gigantes: remove font-size herdada do Tailwind base */
          .excalidraw-wrapper svg {
            max-width: none !important;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>

        <div
          className="excalidraw-wrapper"
          style={{ opacity: isLoaded ? 1 : 0, transition: "opacity 0.2s" }}
        >
          <ExcalidrawCore
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            excalidrawAPI={(api: any) => {
              setExcalidrawAPI(api as ExcalidrawAPI);
              setIsLoaded(true);
            }}
            initialData={initialData}
            onChange={scheduleAutoSave}
            langCode="pt-BR"
            UIOptions={{
              canvasActions: {
                export: false,
                saveAsImage: false,
                loadScene: false,
              },
              tools: { image: false },
            }}
          />
        </div>
      </div>
    </div>
  );
}
