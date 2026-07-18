export type ItemType =
  | "IMAGE"
  | "PDF"
  | "AUDIO"
  | "NOTE"
  | "SNIPPET"
  | "LINK"
  | "PASSWORD";

export type LabelColor =
  | "violet"
  | "rose"
  | "amber"
  | "emerald"
  | "sky"
  | "stone";

export type PasswordStrength = "weak" | "medium" | "strong";

export type SortField = "name" | "updatedAt" | "type" | "fileSize";
export type SortDirection = "asc" | "desc";
export type ViewMode = "grid" | "list";

export interface Folder {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: LabelColor;
  icon: string;
  parentId: string | null;
  order: number;
  isRoot: boolean;
  itemCount: number;
  folderCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FolderNode extends Folder {
  children: FolderNode[];
}

export interface VaultItem {
  id: string;
  userId: string;
  folderId: string | null;

  type: ItemType;
  title: string;
  description: string | null;
  tags: string[];
  color: LabelColor;

  isFavorite: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;

  // Arquivo (Cloudinary)
  url: string | null;
  fileKey: string | null;
  fileSize: number | null;
  mimeType: string | null;

  // Snippet
  codeLanguage: string | null;
  codeContent: string | null;

  // Nota
  noteContent: string | null;

  // Link
  linkOgTitle: string | null;
  linkOgDescription: string | null;
  linkOgImage: string | null;
  linkFavicon: string | null;

  // Senha — apenas metadados no client; valores reais nunca chegam sem senha mestra
  hasPassword: boolean;
  passwordStrength: PasswordStrength | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface BreadcrumbEntry {
  id: string | null; // null = raiz
  name: string;
}

export interface SelectionState {
  selectedIds: Set<string>;
  lastSelectedId: string | null;
}

export interface DragPayload {
  kind: "item" | "folder";
  id: string;
  ids?: string[]; // quando arrastando seleção múltipla
}

export interface StorageUsage {
  used: number;
  limit: number;
  plan: "free" | "pro" | "business";
}
