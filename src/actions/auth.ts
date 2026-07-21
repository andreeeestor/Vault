"use server";

import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validators";

export async function registerUser(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "Este e-mail já está em uso." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    const user = await tx.user.create({
      data: { name, email, passwordHash },
    });

    await tx.folder.create({
      data: {
        userId: user.id,
        name: "Meu Vault",
        isRoot: true,
        color: "violet",
        icon: "folder",
        order: 0,
      },
    });
  });

  return { ok: true };
}
