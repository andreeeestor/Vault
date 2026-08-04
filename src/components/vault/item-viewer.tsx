"use client";

import { useState, useEffect } from "react";
import { ZoomIn, ZoomOut, ExternalLink, Bell, CheckCircle2, Clock } from "lucide-react";
import type { VaultItem } from "@/types";
import { PasswordField } from "./password-item";
import { SnippetEditor } from "./snippet-editor";
import { NoteEditor } from "./note-editor";
import { DiagramEditor } from "./diagram-editor";
import { cn } from "@/lib/utils";

export function ItemViewer({ item }: { item: VaultItem }) {
  switch (item.type) {
    case "IMAGE":
      return <ImageViewer item={item} />;
    case "PDF":
      return <PdfViewer item={item} />;
    case "AUDIO":
      return <AudioViewer item={item} />;
    case "NOTE":
      return <NoteEditor item={item} />;
    case "SNIPPET":
      return <SnippetEditor item={item} />;
    case "LINK":
      return <LinkViewer item={item} />;
    case "PASSWORD":
      return (
        <div className="mx-auto w-full max-w-md p-8">
          <PasswordField item={item} />
        </div>
      );
    case "REMINDER":
      return <ReminderViewer item={item} />;
    case "DIAGRAM":
      return <DiagramEditor item={item} />;
  }
}

function ImageViewer({ item }: { item: VaultItem }) {
  const [zoom, setZoom] = useState(1);
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 items-center justify-center overflow-auto bg-[#0C0A0F] p-6">
        {item.url && (
          
          <img
            src={item.url}
            alt={item.title}
            style={{ transform: `scale(${zoom})` }}
            className="max-h-full max-w-full rounded-[var(--radius-md)] object-contain transition-transform duration-200"
          />
        )}
      </div>
      <div className="flex items-center justify-center gap-2 border-t border-[var(--border)] bg-[var(--surface)] py-2">
        <button
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
          className="rounded-md p-1.5 text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="w-12 text-center text-xs tabular-nums text-[var(--foreground-muted)]">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
          className="rounded-md p-1.5 text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function PdfViewer({ item }: { item: VaultItem }) {
  return (
    <div className="flex h-full flex-col bg-[#0C0A0F]">
      {item.url ? (
        <iframe
          src={item.url}
          title={item.title}
          className="h-full w-full border-0"
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-[var(--foreground-subtle)]">
          Documento indisponível
        </div>
      )}
    </div>
  );
}

function AudioViewer({ item }: { item: VaultItem }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
      <div
        className="flex h-28 w-28 items-center justify-center rounded-full"
        style={{ background: "var(--gradient-brand-soft)" }}
      >
        <WaveformIcon />
      </div>
      <p className="text-heading text-lg font-medium text-[var(--foreground)]">
        {item.title}
      </p>
      {item.url && (
        <audio controls src={item.url} className="w-full max-w-md">
          <track kind="captions" />
        </audio>
      )}
    </div>
  );
}

function WaveformIcon() {
  const bars = [8, 16, 24, 14, 20, 10, 18];
  return (
    <div className="flex items-end gap-1">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-1.5 rounded-full"
          style={{ height: h, background: "var(--primary)" }}
        />
      ))}
    </div>
  );
}

function LinkViewer({ item }: { item: VaultItem }) {
  return (
    <div className="mx-auto w-full max-w-lg p-8">
      <a
        href={item.url ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]",
        )}
      >
        {item.linkOgImage && (
          
          <img
            src={item.linkOgImage}
            alt={item.title}
            className="h-48 w-full object-cover"
          />
        )}
        <div className="flex flex-col gap-1.5 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-heading font-semibold text-[var(--foreground)]">
              {item.linkOgTitle ?? item.title}
            </h3>
            <ExternalLink className="h-4 w-4 shrink-0 text-[var(--foreground-subtle)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          {item.linkOgDescription && (
            <p className="text-body text-sm text-[var(--foreground-muted)]">
              {item.linkOgDescription}
            </p>
          )}
          <span className="text-caption truncate text-xs text-[var(--foreground-subtle)]">
            {item.url}
          </span>
        </div>
      </a>
    </div>
  );
}

function ReminderViewer({ item }: { item: VaultItem }) {
  const reminderAt = item.reminderAt ? new Date(item.reminderAt) : null;
  const isSent = item.reminderSent;
  const now = new Date();
  const isOverdue = reminderAt && reminderAt < now && !isSent;

  const [timeLeft, setTimeLeft] = useState(() => {
    if (!reminderAt || isSent) return null;
    const diff = reminderAt.getTime() - Date.now();
    return diff > 0 ? diff : 0;
  });

  useEffect(() => {
    if (isSent || !reminderAt) return;
    const interval = setInterval(() => {
      const diff = reminderAt.getTime() - Date.now();
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [reminderAt, isSent]);

  const formatTimeLeft = (ms: number) => {
    if (ms <= 0) return "Pronto para envio";
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h ${m % 60}min`;
    if (h > 0) return `${h}h ${m % 60}min`;
    if (m > 0) return `${m}min ${s % 60}s`;
    return `${s}s`;
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-lg">
        {/* Status badge */}
        <div className="mb-6 flex justify-center">
          {isSent ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              E-mail enviado com sucesso
            </span>
          ) : isOverdue ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 text-sm font-medium text-amber-600">
              <Clock className="h-4 w-4" />
              Aguardando processamento
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 text-sm font-medium text-violet-600">
              <Bell className="h-4 w-4" />
              Lembrete agendado
            </span>
          )}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-[var(--shadow-md)]">
          {/* Header */}
          <div
            className="flex items-center gap-4 px-6 py-5 border-b border-[var(--border)]"
            style={{ background: "linear-gradient(135deg, #7C3AED12, #A855F712)" }}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}
            >
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-[var(--foreground)] truncate">
                {item.title}
              </h2>
              <p className="text-sm text-[var(--foreground-subtle)] mt-0.5">
                Lembrete por e-mail
              </p>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-5">
            {/* Description */}
            {item.noteContent && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-subtle)] mb-2">
                  Mensagem
                </p>
                <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-line bg-[var(--background-elevated)] rounded-xl p-4 border border-[var(--border)]">
                  {item.noteContent}
                </p>
              </div>
            )}

            {/* Scheduled date */}
            {reminderAt && (
              <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--background-elevated)] px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-subtle)] mb-0.5">
                    Agendado para
                  </p>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {reminderAt.toLocaleString("pt-BR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Countdown */}
            {!isSent && timeLeft !== null && (
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-500/70 mb-1">
                  {timeLeft > 0 ? "Envio em" : "Pronto para envio"}
                </p>
                <p className="text-2xl font-bold tabular-nums text-violet-600">
                  {timeLeft > 0 ? formatTimeLeft(timeLeft) : "⏳"}
                </p>
              </div>
            )}

            {/* Sent confirmation */}
            {isSent && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-4 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-emerald-600">
                  O e-mail foi enviado com sucesso.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
