"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createFolderSchema, moveItemsSchema, renameSchema } from "@/lib/validators";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");
  return session.user.id;
}

export async function createFolder(input: unknown) {
  const userId = await requireUserId();
  const data = createFolderSchema.parse(input);

  const siblingCount = await db.folder.count({
    where: { userId, parentId: data.parentId },
  });

  const folder = await db.folder.create({
    data: {
      userId,
      name: data.name,
      parentId: data.parentId,
      color: data.color,
      order: siblingCount,
    },
  });

  revalidatePath("/vault");
  return folder;
}

export async function renameFolder(input: unknown) {
  const userId = await requireUserId();
  const { id, name } = renameSchema.parse(input);

  await db.folder.update({
    where: { id, userId },
    data: { name },
  });

  revalidatePath("/vault");
}

export async function updateFolderColor(folderId: string, color: string) {
  const userId = await requireUserId();
  await db.folder.update({
    where: { id: folderId, userId },
    data: { color },
  });
  revalidatePath("/vault");
}

export async function deleteFolder(folderId: string) {
  const userId = await requireUserId();
  // onDelete: Cascade no schema remove subpastas; itens ficam com folderId = null (SetNull)
  await db.folder.delete({ where: { id: folderId, userId } });
  revalidatePath("/vault");
}

export async function moveEntities(input: unknown) {
  const userId = await requireUserId();
  const { itemIds, folderIds, destinationFolderId } = moveItemsSchema.parse(input);

  await db.$transaction([
    db.item.updateMany({
      where: { id: { in: itemIds }, userId },
      data: { folderId: destinationFolderId },
    }),
    db.folder.updateMany({
      where: { id: { in: folderIds }, userId },
      data: { parentId: destinationFolderId },
    }),
  ]);

  revalidatePath("/vault");
}

export async function listFolderTree(userId: string) {
  const folders = await db.folder.findMany({
    where: { userId },
    orderBy: { order: "asc" },
    include: {
      items: {
        where: { isDeleted: false, isArchived: false },
        select: { id: true },
      },
      _count: { select: { children: true } },
    },
  });

  return folders.map((f) => ({
    ...f,
    _count: {
      children: f._count.children,
      items: f.items.length,
    },
  }));
}
