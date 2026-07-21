

import type { Folder as PrismaFolder, Item as PrismaItem, User as PrismaUser } from "@prisma/client";
import type { Folder, VaultItem, StorageUsage } from "@/types";

export function mapFolder(
  f: PrismaFolder & { _count?: { items: number; children: number } }
): Folder {
  return {
    id: f.id,
    userId: f.userId,
    name: f.name,
    description: f.description,
    color: (f.color as Folder["color"]) ?? "violet",
    icon: f.icon,
    parentId: f.parentId,
    order: f.order,
    isRoot: f.isRoot,
    itemCount: f._count?.items ?? 0,
    folderCount: f._count?.children ?? 0,
    createdAt: new Date(f.createdAt),
    updatedAt: new Date(f.updatedAt),
  };
}

export function mapItem(i: PrismaItem): VaultItem {
  return {
    id: i.id,
    userId: i.userId,
    folderId: i.folderId,
    type: i.type as VaultItem["type"],
    title: i.title,
    description: i.description,
    tags: i.tags,
    color: (i.color as VaultItem["color"]) ?? "violet",
    isFavorite: i.isFavorite,
    isArchived: i.isArchived,
    isDeleted: i.isDeleted,
    deletedAt: i.deletedAt ? new Date(i.deletedAt) : null,
    url: i.url,
    fileKey: i.fileKey,
    fileSize: i.fileSize !== null ? Number(i.fileSize) : null,
    mimeType: i.mimeType,
    codeLanguage: i.codeLanguage,
    codeContent: i.codeContent,
    noteContent: i.noteContent,
    linkOgTitle: i.linkOgTitle,
    linkOgDescription: i.linkOgDescription,
    linkOgImage: i.linkOgImage,
    linkFavicon: i.linkFavicon,
    hasPassword: !!(i as any).encryptedPassword,
    passwordStrength: (i.passwordStrength as VaultItem["passwordStrength"]) ?? null,
    reminderAt: (i as any).reminderAt ? new Date((i as any).reminderAt) : null,
    reminderSent: !!(i as any).reminderSent,
    createdAt: new Date(i.createdAt),
    updatedAt: new Date(i.updatedAt),
  };
}

export function mapStorageUsage(
  user: Pick<PrismaUser, "storageUsed" | "storageLimit" | "plan">
): StorageUsage {
  return {
    used: Number(user.storageUsed),
    limit: Number(user.storageLimit),
    plan: (user.plan as StorageUsage["plan"]) ?? "free",
  };
}
