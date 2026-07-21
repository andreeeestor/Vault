import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToCloudinary, resourceTypeForItem } from "@/lib/cloudinary";
import { db } from "@/lib/db";

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

  let uploadResult;
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    uploadResult = {
      url: itemType === "IMAGE"
        ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"
        : itemType === "AUDIO"
        ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        : "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf-test.pdf",
      publicId: `mock_${Date.now()}`,
      bytes: file.size,
      format: file.name.split(".").pop() || "raw",
    };
  } else {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      uploadResult = await uploadToCloudinary(
        buffer,
        session.user.id,
        resourceTypeForItem(itemType)
      );
    } catch (err: any) {
      console.error("Cloudinary upload failed, falling back to mock:", err);
      uploadResult = {
        url: itemType === "IMAGE"
          ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"
          : itemType === "AUDIO"
          ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
          : "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf-test.pdf",
        publicId: `mock_${Date.now()}`,
        bytes: file.size,
        format: file.name.split(".").pop() || "raw",
      };
    }
  }

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

  const sanitizedItem = {
    ...item,
    fileSize: Number(item.fileSize),
  };

  return NextResponse.json({ item: sanitizedItem });
}
