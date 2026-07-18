import {
  Image as ImageIcon,
  FileText,
  Music,
  StickyNote,
  Code2,
  Link2,
  KeyRound,
  type LucideIcon,
} from "lucide-react";
import type { ItemType } from "@/types";

interface ItemTypeMeta {
  label: string;
  icon: LucideIcon;
  accent: string;
}

export const ITEM_TYPE_META: Record<ItemType, ItemTypeMeta> = {
  IMAGE: { label: "Imagem", icon: ImageIcon, accent: "#7C3AED" },
  PDF: { label: "PDF", icon: FileText, accent: "#DC2626" },
  AUDIO: { label: "Áudio", icon: Music, accent: "#0284C7" },
  NOTE: { label: "Nota", icon: StickyNote, accent: "#D97706" },
  SNIPPET: { label: "Snippet", icon: Code2, accent: "#059669" },
  LINK: { label: "Link", icon: Link2, accent: "#7C3AED" },
  PASSWORD: { label: "Senha", icon: KeyRound, accent: "#E11D48" },
};
