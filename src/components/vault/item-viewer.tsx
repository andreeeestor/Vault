"use client";

import { useState } from "react";
import { ZoomIn, ZoomOut, ExternalLink } from "lucide-react";
import type { VaultItem } from "@/types";
import { PasswordField } from "./password-item";
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
      return <NoteViewer item={item} />;
    case "SNIPPET":
      return <SnippetViewer item={item} />;
    case "LINK":
      return <LinkViewer item={item} />;
    case "PASSWORD":
      return (
        <div className="mx-auto w-full max-w-md p-8">
          <PasswordField label="Senha" username="ana@exemplo.com" />
        </div>
      );
  }
}

function ImageViewer({ item }: { item: VaultItem }) {
  const [zoom, setZoom] = useState(1);
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 items-center justify-center overflow-auto bg-[#0C0A0F] p-6">
        {item.url && (
          // eslint-disable-next-line @next/next/no-img-element
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
        <iframe src={item.url} title={item.title} className="h-full w-full border-0" />
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
      <p className="text-heading text-lg font-medium text-[var(--foreground)]">{item.title}</p>
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

function NoteViewer({ item }: { item: VaultItem }) {
  return (
    <div className="mx-auto h-full w-full max-w-2xl overflow-y-auto p-8">
      <article className="prose-vault">
        {(item.noteContent ?? "").split("\n").map((line, i) => (
          <MarkdownLine key={i} line={line} />
        ))}
      </article>
    </div>
  );
}

function MarkdownLine({ line }: { line: string }) {
  if (line.startsWith("# "))
    return <h1 className="text-display mb-3 mt-1 text-2xl font-bold text-[var(--foreground)]">{line.slice(2)}</h1>;
  if (line.startsWith("## "))
    return <h2 className="text-heading mb-2 mt-4 text-xl font-semibold text-[var(--foreground)]">{line.slice(3)}</h2>;
  if (line.startsWith("- "))
    return <li className="text-body ml-4 text-sm text-[var(--foreground-muted)]">{line.slice(2)}</li>;
  if (line.trim() === "") return <div className="h-2" />;
  return <p className="text-body text-sm text-[var(--foreground-muted)]">{line}</p>;
}

function SnippetViewer({ item }: { item: VaultItem }) {
  return (
    <div className="flex h-full flex-col bg-[#0C0A0F]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="text-xs font-medium text-violet-300">{item.codeLanguage}</span>
      </div>
      <pre className="flex-1 overflow-auto p-6 text-sm leading-relaxed text-violet-100">
        <code>{item.codeContent}</code>
      </pre>
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
          "group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
        )}
      >
        {item.linkOgImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.linkOgImage} alt={item.title} className="h-48 w-full object-cover" />
        )}
        <div className="flex flex-col gap-1.5 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-heading font-semibold text-[var(--foreground)]">
              {item.linkOgTitle ?? item.title}
            </h3>
            <ExternalLink className="h-4 w-4 shrink-0 text-[var(--foreground-subtle)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          {item.linkOgDescription && (
            <p className="text-body text-sm text-[var(--foreground-muted)]">{item.linkOgDescription}</p>
          )}
          <span className="text-caption truncate text-xs text-[var(--foreground-subtle)]">{item.url}</span>
        </div>
      </a>
    </div>
  );
}
