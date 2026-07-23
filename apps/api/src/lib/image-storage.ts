import { del, put } from "@vercel/blob";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const localUploadsRoot = fileURLToPath(new URL("../../uploads/", import.meta.url));
const validImageName = /^[a-zA-Z0-9-]+\.(jpg|png|webp)$/;

export type ImageMimeType = "image/jpeg" | "image/png" | "image/webp";

const isVercelBlobEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const localFileNameFromUrl = (url: string): string | undefined => {
  if (!url.startsWith("/uploads/")) {
    return undefined;
  }

  const fileName = url.slice("/uploads/".length);
  return validImageName.test(fileName) ? fileName : undefined;
};

const isVercelBlobUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
};

export const storePublicImage = async (input: {
  fileName: string;
  folder: "players" | "teams";
  buffer: Buffer;
  contentType: ImageMimeType;
}): Promise<{ url: string }> => {
  if (isVercelBlobEnabled()) {
    const blob = await put(`${input.folder}/${input.fileName}`, input.buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: input.contentType
    });

    return { url: blob.url };
  }

  await mkdir(localUploadsRoot, { recursive: true });
  await writeFile(`${localUploadsRoot}${input.fileName}`, input.buffer);
  return { url: `/uploads/${input.fileName}` };
};

export const removeStoredImage = async (url: string | undefined, nextUrl?: string): Promise<void> => {
  if (!url || url === nextUrl) {
    return;
  }

  const localFileName = localFileNameFromUrl(url);
  if (localFileName) {
    try {
      await unlink(`${localUploadsRoot}${localFileName}`);
    } catch (error: unknown) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) {
        throw error;
      }
    }
    return;
  }

  if (isVercelBlobEnabled() && isVercelBlobUrl(url)) {
    await del(url);
  }
};
