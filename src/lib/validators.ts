import { z } from "zod";

export const itemTypeSchema = z.enum([
  "IMAGE",
  "PDF",
  "AUDIO",
  "NOTE",
  "SNIPPET",
  "LINK",
  "PASSWORD",
]);

export const labelColorSchema = z.enum([
  "violet",
  "rose",
  "amber",
  "emerald",
  "sky",
  "stone",
]);

export const createFolderSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(120),
  parentId: z.string().nullable(),
  color: z.string().optional().default("violet"),
});

export const renameSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Nome é obrigatório").max(120),
});

export const moveItemsSchema = z.object({
  itemIds: z.array(z.string()).default([]),
  folderIds: z.array(z.string()).default([]),
  destinationFolderId: z.string().nullable(),
});

export const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(200),
  folderId: z.string().nullable(),
  noteContent: z.string().default(""),
  tags: z.array(z.string()).default([]),
});

export const createSnippetSchema = z.object({
  title: z.string().trim().min(1).max(200),
  folderId: z.string().nullable(),
  codeLanguage: z.string().default("plaintext"),
  codeContent: z.string().default(""),
});

export const createLinkSchema = z.object({
  title: z.string().trim().min(1).max(200),
  folderId: z.string().nullable(),
  url: z.string().url("URL inválida"),
});

export const createPasswordItemSchema = z.object({
  title: z.string().trim().min(1).max(200),
  folderId: z.string().nullable(),
  username: z.string().optional(),
  password: z.string().min(1, "Senha é obrigatória"),
  notes: z.string().optional(),
  masterPassword: z.string().min(1, "Senha mestra é obrigatória"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Nome muito curto"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(8, "Mínimo de 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe sua senha"),
});
