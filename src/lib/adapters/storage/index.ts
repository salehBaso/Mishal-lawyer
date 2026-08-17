import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';

/**
 * Storage Adapter — تخزين كائنات متوافق مع S3 (AWS S3 / DigitalOcean Spaces
 * / Cloudflare R2). لا تُخزَّن الملفات أبدًا داخل خادم التطبيق نفسه.
 *
 * أمان الملفات:
 *  - الرفع والتنزيل يتمّان عبر Signed URL محدود الصلاحية (STORAGE_SIGNED_URL_TTL_SECONDS)
 *    وليس عبر روابط عامة دائمة.
 *  - التحقق من نوع/حجم الملف يتم Server-Side قبل إصدار رابط الرفع
 *    (راجع src/lib/validation/document.ts).
 */

function getClient(): S3Client {
  return new S3Client({
    region: process.env.STORAGE_REGION ?? 'me-central-1',
    endpoint: process.env.STORAGE_ENDPOINT || undefined,
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY ?? '',
    },
  });
}

const BUCKET = process.env.STORAGE_BUCKET ?? 'mishal-legal-documents';
const TTL = Number(process.env.STORAGE_SIGNED_URL_TTL_SECONDS ?? 900);

export function buildStorageKey(orgId: string, caseId: string | null, fileName: string): string {
  const safeName = fileName.replace(/[^\w.\-؀-ۿ]/g, '_');
  const scope = caseId ? `cases/${caseId}` : 'general';
  return `orgs/${orgId}/${scope}/${nanoid(10)}-${safeName}`;
}

export async function getUploadUrl(storageKey: string, contentType: string) {
  const client = getClient();
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: storageKey,
    ContentType: contentType,
    ServerSideEncryption: 'AES256', // Encryption at Rest
  });
  return getSignedUrl(client, command, { expiresIn: TTL });
}

export async function getDownloadUrl(storageKey: string) {
  const client = getClient();
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: storageKey });
  return getSignedUrl(client, command, { expiresIn: TTL });
}

export async function deleteObject(storageKey: string) {
  const client = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: storageKey }));
}
