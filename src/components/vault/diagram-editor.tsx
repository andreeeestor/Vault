"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
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
const ExcalidrawCore = dynamic(
  async () => {
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isInitialMount = useRef(true);
  const updateItem = useVaultStore((s) => s.updateItem);
  const markTabDirty = useVaultStore((s) => s.markTabDirty);
  const markTabClean = useVaultStore((s) => s.markTabClean);

  useEffect(() => {
    if (hasUnsavedChanges) {
      markTabDirty(item.id);
    } else {
      markTabClean(item.id);
    }
  }, [hasUnsavedChanges, item.id, markTabDirty, markTabClean]);

  useEffect(() => {
    return () => markTabClean(item.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

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
          width: undefined,
          height: undefined,
        },
        files: parsed.files ?? {},
        scrollToContent: true,
      };
    } catch (err) {
      console.error("Erro ao carregar dados do diagrama:", err);
      return undefined;
    }
  })()).current;

  // Função manual de salvamento
  const handleSave = useCallback(async () => {
    if (!excalidrawAPI || saveStatus === "saving") return;
    setSaveStatus("saving");

    try {
      const { serializeAsJSON } = await import("@excalidraw/excalidraw");
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const files = typeof (excalidrawAPI as any).getFiles === "function" ? (excalidrawAPI as any).getFiles() : {};

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const json = serializeAsJSON(elements as any, appState as any, files, "local");
      await updateDiagramData(item.id, json);
      updateItem(item.id, { diagramData: json });

      setSaveStatus("saved");
      setHasUnsavedChanges(false);
      toast.success("Diagrama salvo com sucesso!");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (err) {
      console.error("Erro ao salvar diagrama:", err);
      setSaveStatus("error");
      toast.error("Erro ao salvar o diagrama.");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [excalidrawAPI, saveStatus, item.id, updateItem]);

  // Captura alterações na cena (marca como alterado)
  const handleChange = useCallback(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setHasUnsavedChanges(true);
  }, []);

  // Atalho de teclado Ctrl+S / Cmd+S para salvar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

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
      toast.error("Erro ao exportar imagem.");
    }
  }, [excalidrawAPI, item.title]);

  return (
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
        {/* Status de alteração / salvamento */}
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
              Salvo no cofre
            </span>
          )}
          {saveStatus === "error" && (
            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#dc2626" }}>
              <AlertCircle style={{ width: "13px", height: "13px" }} />
              Erro ao salvar
            </span>
          )}
          {saveStatus === "idle" && isLoaded && (
            hasUnsavedChanges ? (
              <span style={{ fontSize: "12px", color: "#d97706", fontWeight: 500 }}>
                ● Alterações não salvas
              </span>
            ) : (
              <span style={{ fontSize: "12px", color: "var(--foreground-subtle)" }}>
                Sem alterações pendentes
              </span>
            )
          )}
        </div>

        {/* Ações */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={handleSave}
            disabled={!isLoaded || saveStatus === "saving"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "6px",
              border: "none",
              background: hasUnsavedChanges
                ? "var(--primary)"
                : "var(--surface-hover)",
              color: hasUnsavedChanges ? "#ffffff" : "var(--foreground)",
              cursor: isLoaded && saveStatus !== "saving" ? "pointer" : "not-allowed",
              opacity: isLoaded && saveStatus !== "saving" ? 1 : 0.6,
              transition: "all 0.15s ease-in-out",
              flexShrink: 0,
              boxShadow: hasUnsavedChanges ? "0 2px 8px rgba(124, 58, 237, 0.25)" : "none",
            }}
          >
            {saveStatus === "saving" ? (
              <Loader2 style={{ width: "13px", height: "13px", animation: "spin 1s linear infinite" }} />
            ) : (
              <Save style={{ width: "13px", height: "13px" }} />
            )}
            Salvar
          </button>

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
      </div>

      {/* ── Canvas ────────────────────────────────────────────────────── */}
      <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
        {!isLoaded && <DiagramSkeleton />}

        <style>{`
          .excalidraw-wrapper {
            height: 100%;
            width: 100%;
            position: absolute;
            inset: 0;
          }
          .excalidraw-wrapper .excalidraw {
            border-radius: 0 !important;
          }
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
            onChange={handleChange}
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

