import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';
import { env } from './env';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const MAGIC_BYTES: Record<string, Uint8Array> = {
  jpeg: new Uint8Array([0xFF, 0xD8, 0xFF]),
  png: new Uint8Array([0x89, 0x50, 0x4E, 0x47]),
  webp: new Uint8Array([0x52, 0x49, 0x46, 0x46]), // "RIFF" — webp files start with RIFF
};

function getExtFromMagic(buffer: Uint8Array): string | null {
  for (const [ext, magic] of Object.entries(MAGIC_BYTES)) {
    if (buffer.length >= magic.length && magic.every((b, i) => buffer[i] === b)) {
      return ext;
    }
  }
  return null;
}

export type UploadResult = { url: string };

export async function uploadFile(
  file: File,
  options?: { maxSize?: number }
): Promise<UploadResult> {
  const maxSize = options?.maxSize ?? MAX_FILE_SIZE;

  if (file.size > maxSize) {
    throw new Error('File exceeds maximum size of 5MB');
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const detectedExt = getExtFromMagic(new Uint8Array(buffer));
  if (!detectedExt) {
    throw new Error('File content does not match an allowed image format.');
  }

  const filename = `${crypto.randomUUID()}.${detectedExt}`;

  if (env.STORAGE_BUCKET) {
    // TODO: Upload to S3 when STORAGE_ACCESS_KEY / STORAGE_SECRET_KEY are configured.
    // For now, fall through to local storage.
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), buffer);

  return { url: `/uploads/${filename}` };
}
