"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  assessPasswordStrength,
  decryptSecret,
  encryptSecret,
  generateSalt,
  hashMasterPassword,
  verifyMasterPassword,
} from "@/lib/crypto";
import { createPasswordItemSchema } from "@/lib/validators";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");
  return session.user.id;
}

export async function hasMasterPasswordSet(): Promise<boolean> {
  const userId = await requireUserId();
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { vaultMasterKeyHash: true },
  });
  return !!user?.vaultMasterKeyHash;
}

export async function setupMasterPassword(masterPassword: string) {
  const userId = await requireUserId();
  const salt = generateSalt();
  const hash = hashMasterPassword(masterPassword, salt);

  await db.user.update({
    where: { id: userId },
    data: { vaultSalt: salt, vaultMasterKeyHash: hash },
  });
}

export async function changeMasterPassword(currentMaster: string, newMaster: string) {
  const userId = await requireUserId();
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });

  if (!user.vaultSalt || !user.vaultMasterKeyHash) {
    throw new Error("Senha mestra não configurada.");
  }

  if (!verifyMasterPassword(currentMaster, user.vaultSalt, user.vaultMasterKeyHash)) {
    throw new Error("Senha mestra atual incorreta.");
  }

  const newSalt = generateSalt();
  const newHash = hashMasterPassword(newMaster, newSalt);

  const items = await db.item.findMany({
    where: { userId, type: "PASSWORD" },
  });

  const updatePromises = items.map(async (item) => {
    let decryptedUsername: string | null = null;
    let decryptedPassword = "";
    let decryptedNotes: string | null = null;

    if (item.encryptedUsername) {
      decryptedUsername = decryptSecret(item.encryptedUsername, currentMaster, user.vaultSalt!);
    }
    if (item.encryptedPassword) {
      decryptedPassword = decryptSecret(item.encryptedPassword, currentMaster, user.vaultSalt!);
    }
    if (item.encryptedNotes) {
      decryptedNotes = decryptSecret(item.encryptedNotes, currentMaster, user.vaultSalt!);
    }

    const encUsername = decryptedUsername ? encryptSecret(decryptedUsername, newMaster, newSalt) : null;
    const encPassword = encryptSecret(decryptedPassword, newMaster, newSalt);
    const encNotes = decryptedNotes ? encryptSecret(decryptedNotes, newMaster, newSalt) : null;

    return db.item.update({
      where: { id: item.id },
      data: {
        encryptedUsername: encUsername,
        encryptedPassword: encPassword,
        encryptedNotes: encNotes,
      },
    });
  });

  await Promise.all(updatePromises);

  await db.user.update({
    where: { id: userId },
    data: {
      vaultSalt: newSalt,
      vaultMasterKeyHash: newHash,
    },
  });

  revalidatePath("/vault/passwords");
}

export async function createPasswordItem(input: unknown) {
  const userId = await requireUserId();
  const data = createPasswordItemSchema.parse(input);

  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.vaultSalt || !user.vaultMasterKeyHash) {
    throw new Error("Configure sua senha mestra antes de salvar senhas");
  }
  if (!verifyMasterPassword(data.masterPassword, user.vaultSalt, user.vaultMasterKeyHash)) {
    throw new Error("Senha mestra incorreta");
  }

  const strength = assessPasswordStrength(data.password);

  const item = await db.item.create({
    data: {
      userId,
      type: "PASSWORD",
      title: data.title,
      folderId: data.folderId,
      encryptedUsername: data.username
        ? encryptSecret(data.username, data.masterPassword, user.vaultSalt)
        : null,
      encryptedPassword: encryptSecret(data.password, data.masterPassword, user.vaultSalt),
      encryptedNotes: data.notes ? encryptSecret(data.notes, data.masterPassword, user.vaultSalt) : null,
      passwordStrength: strength,
    },
  });

  revalidatePath("/vault/passwords");
  return { id: item.id, passwordStrength: strength };
}

export async function revealPassword(itemId: string, masterPassword: string) {
  const userId = await requireUserId();
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  const item = await db.item.findUniqueOrThrow({ where: { id: itemId, userId } });

  if (!user.vaultSalt || !user.vaultMasterKeyHash) {
    throw new Error("Cofre de senhas não configurado");
  }
  if (!verifyMasterPassword(masterPassword, user.vaultSalt, user.vaultMasterKeyHash)) {
    throw new Error("Senha mestra incorreta");
  }
  if (!item.encryptedPassword) {
    throw new Error("Item não possui senha armazenada");
  }

  return {
    username: item.encryptedUsername
      ? decryptSecret(item.encryptedUsername, masterPassword, user.vaultSalt)
      : null,
    password: decryptSecret(item.encryptedPassword, masterPassword, user.vaultSalt),
    notes: item.encryptedNotes
      ? decryptSecret(item.encryptedNotes, masterPassword, user.vaultSalt)
      : null,
  };
}
