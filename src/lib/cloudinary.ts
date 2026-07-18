import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export type CloudinaryResourceType = "image" | "video" | "raw";

/** Mapeia o tipo de item do Vault para o resource_type esperado pelo Cloudinary. */
export function resourceTypeForItem(itemType: "IMAGE" | "PDF" | "AUDIO"): CloudinaryResourceType {
  switch (itemType) {
    case "IMAGE":
      return "image";
    case "AUDIO":
      return "video"; // Cloudinary trata áudio dentro do pipeline de "video"
    case "PDF":
      return "image"; // PDFs são versionados como "image" para habilitar o viewer de páginas
  }
}

export interface UploadResult {
  url: string;
  publicId: string;
  bytes: number;
  format: string;
}

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string,
  resourceType: CloudinaryResourceType
): Promise<UploadResult> {
  const base64 = fileBuffer.toString("base64");
  const result = await cloudinary.uploader.upload(`data:*/*;base64,${base64}`, {
    folder: `vault/${folder}`,
    resource_type: resourceType,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    bytes: result.bytes,
    format: result.format,
  };
}
