"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Save, Loader2, CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";
import type { VaultItem } from "@/types";
import { updateSpreadsheetData } from "@/actions/items";
import { useVaultStore } from "@/lib/vault-store";

// ─── Tipos ──────────────────────────────────────────────────────────────────
interface SpreadsheetData {
  rows: number;
  cols: number;
  cells: Record<string, string>;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

const DEFAULT_ROWS = 20;
const DEFAULT_COLS = 8;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converte um indice de coluna (0-based) em rotulo estilo Excel (A, B, …, Z, AA, AB). */
function colLabel(index: number): string {
  let label = "";
  let n = index;
  while (true) {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
    if (n < 0) break;
  }
  return label;
}

const cellKey = (row: number, col: number) => `${row},${col}`;

function parseSpreadsheetData(raw: string | null | undefined): SpreadsheetData {
  if (!raw) return { rows: DEFAULT_ROWS, cols: DEFAULT_COLS, cells: {} };
  try {
    const parsed = JSON.parse(raw) as Partial<SpreadsheetData>;
    return {
      rows: typeof parsed.rows === "number" && parsed.rows > 0 ? parsed.rows : DEFAULT_ROWS,
      cols: typeof parsed.cols === "number" && parsed.cols > 0 ? parsed.cols : DEFAULT_COLS,
      cells: parsed.cells && typeof parsed.cells === "object" ? parsed.cells : {},
    };
  } catch {
    return { rows: DEFAULT_ROWS, cols: DEFAULT_COLS, cells: {} };
  }
}

function serializeSpreadsheetData(data: SpreadsheetData): string {
  return JSON.stringify(data);
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function SpreadsheetEditor({ item }: { item: VaultItem }) {
  const [data, setData] = useState<SpreadsheetData>(() => parseSpreadsheetData(item.spreadsheetData));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isInitialMount = useRef(true);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateItem = useVaultStore((s) => s.updateItem);
  const markTabDirty = useVaultStore((s) => s.markTabDirty);
  const markTabClean = useVaultStore((s) => s.markTabClean);

  // ── Dirty tab tracking ────────────────────────────────────────────────────
  useEffect(() => {
    if (hasUnsavedChanges) {
      markTabDirty(item.id);
    } else {
      markTabClean(item.id);
    }
  }, [hasUnsavedChanges, item.id, markTabDirty, markTabClean]);

  useEffect(() => {
    return () => markTabClean(item.id);
  }, [item.id]);

  // ── Sync from external updates (e.g. item loaded) ────────────────────────
  useEffect(() => {
    const parsed = parseSpreadsheetData(item.spreadsheetData);
    setData(parsed);
    setHasUnsavedChanges(false);
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
  }, [item.id, item.spreadsheetData]);

  // ── Cleanup autosave timer ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, []);

  // ── Update cell value ─────────────────────────────────────────────────────
  const updateCell = useCallback(
    (row: number, col: number, value: string) => {
      const key = cellKey(row, col);
      setData((prev) => {
        const newCells = { ...prev.cells, [key]: value };
        const newHasData = Object.keys(newCells).some((k) => newCells[k] !== "");
        const cleaned = newHasData ? newCells : {};
        return { ...prev, cells: cleaned };
      });
      setHasUnsavedChanges(true);
      markTabDirty(item.id);
    },
    [item.id, markTabDirty]
  );

  // ── Add / remove rows & cols ─────────────────────────────────────────────
  const addRow = useCallback(() => {
    setData((prev) => ({ ...prev, rows: prev.rows + 1 }));
    setHasUnsavedChanges(true);
    markTabDirty(item.id);
  }, [item.id, markTabDirty]);

  const removeRow = useCallback(
    (rowIndex: number) => {
      setData((prev) => {
        if (prev.rows <= 1) return prev;
        // Re-index cells: rows > rowIndex shift down by one
        const newCells: Record<string, string> = {};
        Object.entries(prev.cells).forEach(([k, v]) => {
          const [r, c] = k.split(",").map(Number);
          if (r === rowIndex) return; // drop this row's cells
          if (r > rowIndex) newCells[cellKey(r - 1, c)] = v;
          else newCells[cellKey(r, c)] = v;
        });
        return { rows: prev.rows - 1, cols: prev.cols, cells: newCells };
      });
      setHasUnsavedChanges(true);
      markTabDirty(item.id);
    },
    [item.id, markTabDirty]
  );

  const addColumn = useCallback(() => {
    setData((prev) => ({ ...prev, cols: prev.cols + 1 }));
    setHasUnsavedChanges(true);
    markTabDirty(item.id);
  }, [item.id, markTabDirty]);

  const removeColumn = useCallback(
    (colIndex: number) => {
      setData((prev) => {
        if (prev.cols <= 1) return prev;
        const newCells: Record<string, string> = {};
        Object.entries(prev.cells).forEach(([k, v]) => {
          const [r, c] = k.split(",").map(Number);
          if (c === colIndex) return; // drop this col's cells
          if (c > colIndex) newCells[cellKey(r, c - 1)] = v;
          else newCells[cellKey(r, c)] = v;
        });
        return { rows: prev.rows, cols: prev.cols - 1, cells: newCells };
      });
      setHasUnsavedChanges(true);
      markTabDirty(item.id);
    },
    [item.id, markTabDirty]
  );

  // ── Save (manual & autosave) ──────────────────────────────────────────────
  const flushSave = useCallback(() => {
    const json = serializeSpreadsheetData(data);
    updateItem(item.id, { spreadsheetData: json });
  }, [data, item.id, updateItem]);

  const handleSave = useCallback(async () => {
    if (saveStatus === "saving") return;
    setSaveStatus("saving");
    try {
      const json = serializeSpreadsheetData(data);
      await updateSpreadsheetData(item.id, json);
      updateItem(item.id, { spreadsheetData: json });
      setSaveStatus("saved");
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (err) {
      console.error("Erro ao salvar planilha:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [saveStatus, data, item.id, updateItem]);

  // Autosave apos 2s de inatividade (coalesced)
  const requestAutosave = useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      flushSave();
      setHasUnsavedChanges(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    }, 2000);
  }, [flushSave]);

  // Track value changes for autosave trigger
  const prevDataRef = useRef<string>(serializeSpreadsheetData(data));
  useEffect(() => {
    const currentJson = serializeSpreadsheetData(data);
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevDataRef.current = currentJson;
      return;
    }
    if (currentJson !== prevDataRef.current) {
      prevDataRef.current = currentJson;
      requestAutosave();
    }
  }, [data, requestAutosave]);

  // Ctrl+S / Cmd+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  // "vault-save-item" event (emitted by the detail sidebar Save button)
  useEffect(() => {
    const handler = () => handleSave();
    document.addEventListener("vault-save-item", handler);
    return () => document.removeEventListener("vault-save-item", handler);
  }, [handleSave]);

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExportCSV = useCallback(() => {
    const { rows, cols, cells } = data;
    const lines: string[] = [];
    const header = Array.from({ length: cols }, (_, c) => colLabel(c)).join(";");
    lines.push(header);
    for (let r = 0; r < rows; r++) {
      const rowVals: string[] = [];
      for (let c = 0; c < cols; c++) {
        const val = cells[cellKey(r, c)] ?? "";
        // Escape for CSV: wrap in quotes if contains comma, semicolon, or quote
        const escaped = /[",;\n]/.test(val) ? '"' + val.replace(/"/g, '""') + '"' : val;
        rowVals.push(escaped);
      }
      lines.push(rowVals.join(";"));
    }
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.title.replace(/[^a-z0-9]/gi, "-") || "planilha"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data, item.title]);

  // ── Handle cell key navigation (Tab / Arrow) ──────────────────────────────
  const handleKeyDown = useCallback(
    (row: number, col: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "Tab": {
          e.preventDefault();
          const nextCol = e.shiftKey ? col - 1 : col + 1;
          if (nextCol >= 0 && nextCol < data.cols) {
            const input = document.getElementById(`cell-${row}-${nextCol}`) as HTMLInputElement | null;
            input?.focus();
          }
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          const nextCol = col - 1;
          if (nextCol >= 0) {
            const input = document.getElementById(`cell-${row}-${nextCol}`) as HTMLInputElement | null;
            input?.focus();
          }
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          const nextCol = col + 1;
          if (nextCol < data.cols) {
            const input = document.getElementById(`cell-${row}-${nextCol}`) as HTMLInputElement | null;
            input?.focus();
          }
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const nextRow = row - 1;
          if (nextRow >= 0) {
            const input = document.getElementById(`cell-${nextRow}-${col}`) as HTMLInputElement | null;
            input?.focus();
          }
          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          const nextRow = row + 1;
          if (nextRow < data.rows) {
            const input = document.getElementById(`cell-${nextRow}-${col}`) as HTMLInputElement | null;
            input?.focus();
          }
          break;
        }
        case "Enter": {
          e.preventDefault();
          const nextRow = row + 1;
          if (nextRow < data.rows) {
            const input = document.getElementById(`cell-${nextRow}-${col}`) as HTMLInputElement | null;
            input?.focus();
          }
          break;
        }
      }
    },
    [data.cols, data.rows]
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  const { rows, cols, cells } = data;

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
      {/* —— Toolbar —— */}
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
        {/* Status */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
          {saveStatus === "saving" && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                color: "var(--foreground-muted)",
              }}
            >
              <Loader2 style={{ width: "13px", height: "13px", animation: "spin 1s linear infinite" }} />
              Salvando...
            </span>
          )}
          {saveStatus === "saved" && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                color: "#16a34a",
              }}
            >
              <CheckCircle2 style={{ width: "13px", height: "13px" }} />
              Salvo no cofre
            </span>
          )}
          {saveStatus === "error" && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                color: "#dc2626",
              }}
            >
              <AlertCircle style={{ width: "13px", height: "13px" }} />
              Erro ao salvar
            </span>
          )}
          {saveStatus === "idle" && hasUnsavedChanges && (
            <span style={{ fontSize: "12px", color: "#d97706", fontWeight: 500 }}>
              . Alteracoes nao salvas
            </span>
          )}
          {saveStatus === "idle" && !hasUnsavedChanges && (
            <span style={{ fontSize: "12px", color: "var(--foreground-subtle)" }}>
              Sem alteracoes pendentes
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={addRow}
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
              cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            <Plus style={{ width: "12px", height: "12px" }} /> + Linha
          </button>

          <button
            onClick={addColumn}
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
              cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            <Plus style={{ width: "12px", height: "12px" }} /> + Coluna
          </button>

          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "6px",
              border: "none",
              background: hasUnsavedChanges ? "var(--primary)" : "var(--surface-hover)",
              color: hasUnsavedChanges ? "#ffffff" : "var(--foreground)",
              cursor: saveStatus !== "saving" ? "pointer" : "not-allowed",
              opacity: saveStatus !== "saving" ? 1 : 0.6,
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
            onClick={handleExportCSV}
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
              cursor: "pointer",
              transition: "background 0.15s",
              flexShrink: 0,
            }}
          >
            <Download style={{ width: "12px", height: "12px" }} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* —— Grid —— */}
      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          background: "var(--background)",
        }}
      >
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            tableLayout: "fixed",
            minWidth: "500px",
            fontSize: "13px",
          }}
        >
          <thead style={{ position: "sticky", top: 0, zIndex: 5, background: "var(--surface)" }}>
            <tr>
              {/* Top-left corner cell */}
              <th
                style={{
                  border: "1px solid var(--border)",
                  width: "40px",
                  height: "36px",
                  background: "var(--surface)",
                }}
              />
              {Array.from({ length: cols }).map((_, c) => {
                const isLastCol = c === cols - 1;
                return (
                  <th
                    key={`col-${c}`}
                    style={{
                      border: "1px solid var(--border)",
                      width: "140px",
                      height: "36px",
                      background: "var(--surface-elevated)",
                      position: "relative",
                      textAlign: "center",
                      fontWeight: 600,
                      color: "var(--foreground-subtle)",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {colLabel(c)}
                    {!isLastCol && (
                      <button
                        onClick={() => removeColumn(c)}
                        style={{
                          position: "absolute",
                          top: "2px",
                          right: "2px",
                          width: "14px",
                          height: "14px",
                          borderRadius: "3px",
                          border: "none",
                          background: "transparent",
                          color: "var(--foreground-subtle)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                          opacity: 0.5,
                        }}
                        title="Remover coluna"
                      >
                        <Trash2 style={{ width: "10px", height: "10px" }} />
                      </button>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={`row-${r}`}>
                {/* Row header */}
                <td
                  style={{
                    border: "1px solid var(--border)",
                    width: "40px",
                    height: "32px",
                    background: "var(--surface)",
                    textAlign: "center",
                    fontWeight: 600,
                    color: "var(--foreground-subtle)",
                    fontSize: "11px",
                    position: "sticky",
                    left: 0,
                    zIndex: 3,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
                    <span>{r + 1}</span>
                    {r === rows - 1 && (
                      <button
                        onClick={() => removeRow(r)}
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "3px",
                          border: "none",
                          background: "transparent",
                          color: "var(--foreground-subtle)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                          opacity: 0.5,
                        }}
                        title="Remover linha"
                      >
                        <Trash2 style={{ width: "9px", height: "9px" }} />
                      </button>
                    )}
                  </div>
                </td>
                {Array.from({ length: cols }).map((_, c) => {
                  const isLastCol = c === cols - 1;
                  const inputId = `cell-${r}-${c}`;
                  return (
                    <td
                      key={`cell-${r}-${c}`}
                      style={{
                        border: "1px solid var(--border)",
                        padding: 0,
                        height: "32px",
                        background: "transparent",
                      }}
                    >
                      <input
                        id={inputId}
                        type="text"
                        value={cells[cellKey(r, c)] ?? ""}
                        onChange={(e) => updateCell(r, c, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(r, c, e)}
                        style={{
                          width: "100%",
                          height: "100%",
                          border: "none",
                          outline: "none",
                          padding: "0 6px",
                          background: "transparent",
                          color: "var(--foreground)",
                          fontSize: "13px",
                          fontFamily: "inherit",
                          textAlign: isLastCol ? "right" : "left",
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {rows === 0 && (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              color: "var(--foreground-subtle)",
              fontSize: "13px",
            }}
          >
            A planilha esta vazia. Clique no botao + Linha para comecar.
          </div>
        )}
      </div>
    </div>
  );
}
