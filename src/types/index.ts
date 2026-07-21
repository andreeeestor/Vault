export type ItemType =
  | "IMAGE"
  | "PDF"
  | "AUDIO"
  | "NOTE"
  | "SNIPPET"
  | "LINK"
  | "PASSWORD"
  | "REMINDER";

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

  url: string | null;
  fileKey: string | null;
  fileSize: number | null;
  mimeType: string | null;

  codeLanguage: string | null;
  codeContent: string | null;

  noteContent: string | null;

  linkOgTitle: string | null;
  linkOgDescription: string | null;
  linkOgImage: string | null;
  linkFavicon: string | null;

  hasPassword: boolean;
  passwordStrength: PasswordStrength | null;

  reminderAt?: Date | null;
  reminderSent?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface BreadcrumbEntry {
  id: string | null; 
  name: string;
}

export interface SelectionState {
  selectedIds: Set<string>;
  lastSelectedId: string | null;
}

export interface DragPayload {
  kind: "item" | "folder";
  id: string;
  ids?: string[]; 
}

export interface StorageUsage {
  used: number;
  limit: number;
  plan: "free" | "pro" | "business";
}
