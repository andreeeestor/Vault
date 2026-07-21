import type { Monaco } from "@monaco-editor/react";

export interface SnippetLanguage {
  id: string; 
  label: string;
}

export const SNIPPET_LANGUAGES: SnippetLanguage[] = [
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "json", label: "JSON" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "shell", label: "Shell / Bash" },
  { id: "sql", label: "SQL" },
  { id: "yaml", label: "YAML" },
  { id: "markdown", label: "Markdown" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "java", label: "Java" },
  { id: "csharp", label: "C#" },
  { id: "php", label: "PHP" },
  { id: "ruby", label: "Ruby" },
  { id: "plaintext", label: "Texto simples" },
];

export function languageLabel(id: string): string {
  return SNIPPET_LANGUAGES.find((l) => l.id === id)?.label ?? id;
}

export function defineVaultMonacoThemes(monaco: Monaco): void {
  monaco.editor.defineTheme("vault-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6E6580", fontStyle: "italic" },
      { token: "keyword", foreground: "C084FC" },
      { token: "string", foreground: "86EFAC" },
      { token: "number", foreground: "FCA5A5" },
      { token: "type", foreground: "93C5FD" },
      { token: "function", foreground: "A855F7" },
      { token: "variable", foreground: "F3EFFA" },
    ],
    colors: {
      "editor.background": "#0C0A0F",
      "editor.foreground": "#F3EFFA",
      "editor.lineHighlightBackground": "#171320",
      "editorLineNumber.foreground": "#4A4356",
      "editorLineNumber.activeForeground": "#C084FC",
      "editor.selectionBackground": "#7C3AED40",
      "editorCursor.foreground": "#C084FC",
      "editorGutter.background": "#0C0A0F",
      "scrollbarSlider.background": "#A855F730",
      "scrollbarSlider.hoverBackground": "#A855F750",
    },
  });

  monaco.editor.defineTheme("vault-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "9691A3", fontStyle: "italic" },
      { token: "keyword", foreground: "7C3AED" },
      { token: "string", foreground: "059669" },
      { token: "number", foreground: "DC2626" },
      { token: "type", foreground: "0284C7" },
      { token: "function", foreground: "9333EA" },
      { token: "variable", foreground: "1E1B2E" },
    ],
    colors: {
      "editor.background": "#FFFFFF",
      "editor.foreground": "#1E1B2E",
      "editor.lineHighlightBackground": "#F5F0FC",
      "editorLineNumber.foreground": "#C4B5DE",
      "editorLineNumber.activeForeground": "#7C3AED",
      "editor.selectionBackground": "#7C3AED26",
      "editorCursor.foreground": "#7C3AED",
      "editorGutter.background": "#FFFFFF",
      "scrollbarSlider.background": "#7C3AED20",
      "scrollbarSlider.hoverBackground": "#7C3AED40",
    },
  });
}