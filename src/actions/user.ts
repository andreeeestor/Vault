"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import { resend, EMAIL_FROM } from "@/lib/email";

export async function registerUser(input: unknown) {
  const data = registerSchema.parse(input);

  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("Já existe uma conta com este e-mail");

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await db.user.create({
    data: { name: data.name, email: data.email, passwordHash },
  });

  await db.folder.create({
    data: { userId: user.id, name: "Meu Vault", isRoot: true },
  });

  await resend.emails.send({
    from: EMAIL_FROM,
    to: data.email,
    subject: "Bem-vindo ao Vault",
    html: `<p>Olá ${data.name}, sua conta foi criada com sucesso.</p>`,
  });

  return { id: user.id };
}

export async function updateProfile(input: { name: string; image?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");

  return db.user.update({
    where: { id: session.user.id },
    data: { name: input.name, image: input.image },
  });
}

export async function getStorageUsage() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");

  const user = await db.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { storageUsed: true, storageLimit: true, plan: true },
  });

  return {
    used: Number(user.storageUsed),
    limit: Number(user.storageLimit),
    plan: user.plan as "free" | "pro" | "business",
  };
}
