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
    accent: "#7C3AED",
  },
  {
    icon: MousePointer2,
    title: "Arraste, solte, organize",
    description:
      "Mova itens entre pastas ou direto pelo breadcrumb. Clique direito para renomear, mover, favoritar e mais.",
    accent: "#A855F7",
  },
  {
    icon: Layers,
    title: "7 tipos de conteúdo",
    description:
      "Imagens, PDFs, áudios, notas em markdown, snippets de código, links com preview e senhas — cada um com sua visualização ideal.",
    accent: "#6D28D9",
  },
  {
    icon: Search,
    title: "Busca instantânea",
    description: "Cmd+K abre a busca global. Encontre qualquer item, pasta ou senha em menos de um segundo.",
    accent: "#8B5CF6",
  },
  {
    icon: Tags,
    title: "Tags e etiquetas",
    description: "Organize por cor e por tag. Filtre, ordene por nome, tipo, tamanho ou data com um clique.",
    accent: "#7C3AED",
  },
  {
    icon: Sparkles,
    title: "Editor de notas fluido",
    description: "Markdown com preview em tempo real, atalhos de teclado e auto-save — nunca perca uma ideia.",
    accent: "#A855F7",
  },
];

export function Features() {
  return (
    <section id="features" className="px-6 py-24 lg:px-10" style={{ background: "#F4EFE8" }}>
      <div className="mx-auto max-w-5xl">
        {}
        <div className="mx-auto max-w-xl">
          <span className="text-xs font-bold uppercase tracking-widest text-[#7C3AED]">
            Funcionalidades
          </span>
          <h2 className="font-serif mt-3 text-4xl font-black leading-tight tracking-tight text-[#1E1B2E] sm:text-5xl">
            Feito para quem já se perdeu em 30 abas e 4 apps diferentes
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#1E1B2E]/55">
            Vault substitui a bagunça entre nuvem de fotos, gerenciador de senhas,
            bloco de notas e pasta de downloads.
          </p>
        </div>

        {}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description, accent }) => (
            <div
              key={title}
              className="nb-shadow group cursor-default rounded-2xl border-2 border-[#1E1B2E] bg-white p-6"
            >
              {}
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#1E1B2E]"
                style={{ background: `${accent}18` }}
              >
                <Icon className="h-5 w-5" style={{ color: accent }} strokeWidth={2} />
              </div>

              <h3 className="font-serif mt-5 text-lg font-bold leading-snug text-[#1E1B2E]">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#1E1B2E]/55">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
