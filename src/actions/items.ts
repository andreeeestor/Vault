"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createLinkSchema,
  createNoteSchema,
  createSnippetSchema,
  renameSchema,
} from "@/lib/validators";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");
  return session.user.id;
}

export async function createNote(input: unknown) {
  const userId = await requireUserId();
  const data = createNoteSchema.parse(input);

  const item = await db.item.create({
    data: {
      userId,
      type: "NOTE",
      title: data.title,
      folderId: data.folderId,
      noteContent: data.noteContent,
      tags: data.tags,
    },
  });

  revalidatePath("/vault");
  return item;
}

export async function updateNoteContent(itemId: string, noteContent: string) {
  const userId = await requireUserId();
  await db.item.update({
    where: { id: itemId, userId },
    data: { noteContent },
  });
  revalidatePath("/vault");
}

export async function updateSnippetContent(itemId: string, codeContent: string, codeLanguage: string) {
  const userId = await requireUserId();
  await db.item.update({
    where: { id: itemId, userId },
    data: { codeContent, codeLanguage },
  });
  revalidatePath("/vault");
}

export async function createSnippet(input: unknown) {
  const userId = await requireUserId();
  const data = createSnippetSchema.parse(input);

  const item = await db.item.create({
    data: {
      userId,
      type: "SNIPPET",
      title: data.title,
      folderId: data.folderId,
      codeLanguage: data.codeLanguage,
      codeContent: data.codeContent,
    },
  });

  revalidatePath("/vault");
  return item;
}

export async function createLink(input: unknown) {
  const userId = await requireUserId();
  const data = createLinkSchema.parse(input);

  const item = await db.item.create({
    data: {
      userId,
      type: "LINK",
      title: data.title,
      folderId: data.folderId,
      url: data.url,
    },
  });

  revalidatePath("/vault");
  return item;
}

export async function renameItem(input: unknown) {
  const userId = await requireUserId();
  const { id, name } = renameSchema.parse(input);
  await db.item.update({ where: { id, userId }, data: { title: name } });
  revalidatePath("/vault");
}

export async function toggleFavorite(itemId: string) {
  const userId = await requireUserId();
  const item = await db.item.findUniqueOrThrow({ where: { id: itemId, userId } });
  await db.item.update({ where: { id: itemId }, data: { isFavorite: !item.isFavorite } });
  revalidatePath("/vault");
}

export async function toggleArchive(itemId: string) {
  const userId = await requireUserId();
  const item = await db.item.findUniqueOrThrow({ where: { id: itemId, userId } });
  await db.item.update({ where: { id: itemId }, data: { isArchived: !item.isArchived } });
  revalidatePath("/vault");
}

export async function softDeleteItems(itemIds: string[]) {
  const userId = await requireUserId();
  await db.item.deleteMany({
    where: { id: { in: itemIds }, userId },
  });
  revalidatePath("/vault");
}

export async function restoreItems(itemIds: string[]) {
  const userId = await requireUserId();
  await db.item.updateMany({
    where: { id: { in: itemIds }, userId },
    data: { isDeleted: false, deletedAt: null },
  });
  revalidatePath("/vault");
}

export async function purgeExpiredTrash() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await db.item.deleteMany({
    where: { isDeleted: true, deletedAt: { lt: cutoff } },
  });
}

export async function listAllItems(userId: string) {
  return db.item.findMany({
    where: { userId, isDeleted: false },
    orderBy: { updatedAt: "desc" },
  });
}
