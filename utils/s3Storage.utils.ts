import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { env } from '@/config/env.config';
import logger from './logger.utils';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Generic File Interface
// ─────────────────────────────────────────────────────────────────────────────
export interface S3File {
  /** Name of the file */
  originalname: string;
  /** Buffer of the entire file */
  buffer: Buffer;
  /** MIME type */
  mimetype: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. S3 Client — singleton, properly typed
// ─────────────────────────────────────────────────────────────────────────────
const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
  // Force path-style addressing for S3 buckets
  forcePathStyle: false,
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Allowed folders — enforce at type level
// ─────────────────────────────────────────────────────────────────────────────
type S3Folder =
  | 'profile-photos'
  | 'certification-proofs'
  | 'resume'
  | 'community-posts'
  | 'vehicles';

// ─────────────────────────────────────────────────────────────────────────────
// 4. Core functions — bulletproof
// ─────────────────────────────────────────────────────────────────────────────
export async function uploadToS3(
  file: S3File,
  folder: S3Folder
): Promise<{
  key: string;
  url: string;           // ← permanent public URL (if bucket is public)
  signedUrl: string;     // ← temporary signed URL (always works)
}> {
  if (!file?.buffer) throw new Error('Invalid file: missing buffer');

  const extension = file.originalname.split('.').pop()?.toLowerCase() ?? 'bin';
  const key = `${folder}/${uuidv4()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    // Optional: ACL: 'public-read' if your bucket allows it
  });

  await s3Client.send(command);

  const permanentUrl = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  const signedUrl = await generateSignedUrl(key, 60 * 60 * 24 * 7); // 7 days default

  logger.info(`Uploaded to S3: ${key}`);

  return { key, url: permanentUrl, signedUrl };
}

export async function generateSignedUrl(
  key: string,
  expiresIn = 60 * 15 // default 15 mins
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
  logger.info(`Deleted from S3: ${key}`);
}