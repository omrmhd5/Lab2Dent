import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { get, put } from "@vercel/blob";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function assertPaymentImage(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Upload a JPG, PNG, or WebP screenshot.");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("Screenshot must be 5 MB or smaller.");
  }
}

function extensionFor(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export async function savePaymentScreenshot(file: File) {
  assertPaymentImage(file);

  const filename = `payments/${Date.now()}-${randomBytes(6).toString("hex")}.${extensionFor(file.type)}`;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const useBlob = Boolean(token || process.env.BLOB_STORE_ID);

  if (useBlob) {
    const blob = await put(filename, file, {
      access: "private",
      ...(token ? { token } : {}),
      addRandomSuffix: false,
    });

    return `blob:${blob.pathname}`;
  }

  const diskPath = path.join(process.cwd(), ".data", "uploads", filename);
  await mkdir(path.dirname(diskPath), { recursive: true });
  await writeFile(diskPath, Buffer.from(await file.arrayBuffer()));
  return `local:${filename}`;
}

export async function readPaymentScreenshot(key: string) {
  if (key.startsWith("blob:")) {
    const pathname = key.slice("blob:".length);
    const result = await get(pathname, {
      ...(process.env.BLOB_READ_WRITE_TOKEN
        ? { token: process.env.BLOB_READ_WRITE_TOKEN }
        : {}),
      access: "private",
    });

    if (!result || result.stream === null) {
      return null;
    }

    const bytes = Buffer.from(await new Response(result.stream).arrayBuffer());
    return {
      bytes,
      contentType: result.blob.contentType ?? "image/jpeg",
    };
  }

  if (key.startsWith("local:")) {
    const relative = key.slice("local:".length);
    const diskPath = path.join(process.cwd(), ".data", "uploads", relative);
    const bytes = await readFile(diskPath);
    const ext = path.extname(relative);
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : "image/jpeg";
    return { bytes, contentType };
  }

  return null;
}
