import type { VaultItem } from "@/types";
import { ITEM_TYPE_META } from "@/lib/item-meta";

export function MiniItemThumbnail({ item }: { item: VaultItem }) {
  const meta = ITEM_TYPE_META[item.type];
  const Icon = meta.icon;

  if (item.type === "IMAGE" && item.url) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-slate-950">
        <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-1">
          <p className="truncate text-[7.5px] font-medium text-white">{item.title}</p>
        </div>
      </div>
    );
  }

  if (item.type === "LINK" && item.linkOgImage) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-slate-950">
        <img src={item.linkOgImage} alt={item.title} className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-1">
          <p className="truncate text-[7.5px] font-medium text-white">{item.title}</p>
        </div>
      </div>
    );
  }

  if (item.type === "NOTE" && item.noteContent) {
    return (
      <div className="flex h-full w-full flex-col bg-[#FFFDF5] p-1.5 text-slate-800 dark:bg-[#1C1814] dark:text-amber-100">
        <div className="flex items-center gap-1 border-b border-amber-200/60 pb-0.5 dark:border-amber-800/40">
          <Icon className="h-2.5 w-2.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="truncate text-[7.5px] font-semibold leading-none">{item.title}</p>
        </div>
        <p className="mt-1 line-clamp-3 text-[6.5px] leading-tight text-slate-600 dark:text-amber-200/70">
          {item.noteContent.replace(/^#+\s*/gm, "")}
        </p>
      </div>
    );
  }

  if (item.type === "SNIPPET" && item.codeContent) {
    return (
      <div className="flex h-full w-full flex-col bg-[#110E1B] p-1.5 text-violet-200">
        <div className="flex items-center gap-1 border-b border-violet-900/50 pb-0.5">
          <Icon className="h-2.5 w-2.5 shrink-0 text-emerald-400" />
          <p className="truncate font-mono text-[7.5px] text-emerald-300">{item.title}</p>
        </div>
        <pre className="mt-1 overflow-hidden font-mono text-[6px] leading-tight text-violet-300/80">
          <code>{item.codeContent.slice(0, 50)}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col justify-between bg-white p-1.5 dark:bg-slate-900">
      <div className="flex items-center gap-1">
        <div
          className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded"
          style={{ backgroundColor: `${meta.accent}20`, color: meta.accent }}
        >
          <Icon className="h-2.5 w-2.5" />
        </div>
        <span className="truncate text-[7.5px] font-medium text-slate-800 dark:text-slate-200">
          {item.title}
        </span>
      </div>
      <div className="space-y-0.5 pt-0.5">
        <div className="h-0.5 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-0.5 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}
