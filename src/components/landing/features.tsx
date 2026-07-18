import {
  FolderTree,
  Search,
  MousePointer2,
  Layers,
  Tags,
  Sparkles,
} from "lucide-react";

const FEATURES = [
  {
    icon: FolderTree,
    title: "Pastas de verdade",
    description:
      "Hierarquia infinita, breadcrumb, árvore expansível na lateral — a organização que você já conhece do Drive e do Finder.",
  },
  {
    icon: MousePointer2,
    title: "Arraste, solte, organize",
    description:
      "Mova itens entre pastas ou direto pelo breadcrumb. Clique direito para renomear, mover, favoritar e mais.",
  },
  {
    icon: Layers,
    title: "7 tipos de conteúdo",
    description:
      "Imagens, PDFs, áudios, notas em markdown, snippets de código, links com preview e senhas — cada um com sua visualização ideal.",
  },
  {
    icon: Search,
    title: "Busca instantânea",
    description: "Cmd+K abre a busca global. Encontre qualquer item, pasta ou senha em menos de um segundo.",
  },
  {
    icon: Tags,
    title: "Tags e etiquetas",
    description: "Organize por cor e por tag. Filtre, ordene por nome, tipo, tamanho ou data com um clique.",
  },
  {
    icon: Sparkles,
    title: "Editor de notas fluido",
    description: "Markdown com preview em tempo real, atalhos de teclado e auto-save — nunca perca uma ideia.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-6 py-24 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-display text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
            Feito para quem já se perdeu em 30 abas e 4 apps diferentes
          </h2>
          <p className="text-body mt-3 text-[var(--foreground-muted)]">
            Vault substitui a bagunça entre nuvem de fotos, gerenciador de senhas, bloco de notas e
            pasta de downloads.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 transition-shadow hover:shadow-[var(--shadow-md)]"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]"
                style={{ background: "var(--gradient-brand-soft)" }}
              >
                <Icon className="h-5 w-5 text-[var(--primary)]" strokeWidth={1.75} />
              </div>
              <h3 className="text-heading mt-4 font-semibold text-[var(--foreground)]">{title}</h3>
              <p className="text-body mt-1.5 text-sm text-[var(--foreground-muted)]">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
