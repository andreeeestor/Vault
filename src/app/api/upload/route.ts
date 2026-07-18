import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToCloudinary, resourceTypeForItem } from "@/lib/cloudinary";
import { db } from "@/lib/db";

/**
 * Recebe multipart/form-data com um arquivo + metadados (folderId, type)
 * e cria o Item correspondente no banco após o upload no Cloudinary.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folderId = formData.get("folderId") as string | null;
  const itemType = formData.get("type") as "IMAGE" | "PDF" | "AUDIO" | null;

  if (!(file instanceof File) || !itemType) {
    return NextResponse.json({ error: "Arquivo ou tipo inválido" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadResult = await uploadToCloudinary(
    buffer,
    session.user.id,
    resourceTypeForItem(itemType)
  );

  const item = await db.item.create({
    data: {
      userId: session.user.id,
      folderId,
      type: itemType,
      title: file.name,
      url: uploadResult.url,
      fileKey: uploadResult.publicId,
      fileSize: BigInt(uploadResult.bytes),
      mimeType: file.type,
    },
  });

  await db.user.update({
    where: { id: session.user.id },
    data: { storageUsed: { increment: uploadResult.bytes } },
  });

  return NextResponse.json({ item });
}
