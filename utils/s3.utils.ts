import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/config/env.config";
import logger from "./logger.utils";

// Initialize S3 client
const s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
    // Force path-style addressing for S3 buckets
    forcePathStyle: false,
});

export interface UploadToS3Params {
    fileBuffer: Buffer;
    fileName: string;
    contentType: string;
    userId: string;
}

export interface UploadToS3Result {
    key: string;
    bucket: string;
}

/**
 * Generate a consistent S3 key path for license files
 * Format: licenses/{userId}/{timestamp}-{fileName}
 */
export function generateS3Key(userId: string, fileName: string): string {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `licenses/${userId}/${timestamp}-${sanitizedFileName}`;
}

/**
 * Upload a file buffer to S3
 * @param params - Upload parameters including file buffer, name, content type, and user ID
 * @returns S3 key and bucket name
 */
export async function uploadToS3(params: UploadToS3Params): Promise<UploadToS3Result> {
    const { fileBuffer, fileName, contentType, userId } = params;

    const key = generateS3Key(userId, fileName);

    try {
        const command = new PutObjectCommand({
            Bucket: env.S3_BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
            // Private ACL - files are not publicly accessible
            ACL: "private",
        });

        await s3Client.send(command);

        logger.info(`File uploaded to S3 successfully: ${key}`);

        return {
            key,
            bucket: env.S3_BUCKET_NAME,
        };
    } catch (error) {
        logger.error("Failed to upload file to S3:", error);
        throw new Error(`S3 upload failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Delete a file from S3
 * Used for cleanup/rollback operations
 * @param key - S3 object key to delete
 */
export async function deleteFromS3(key: string): Promise<void> {
    try {
        const command = new DeleteObjectCommand({
            Bucket: env.S3_BUCKET_NAME,
            Key: key,
        });

        await s3Client.send(command);

        logger.info(`File deleted from S3 successfully: ${key}`);
    } catch (error) {
        logger.error("Failed to delete file from S3:", error);
        // Don't throw error for delete operations to avoid cascading failures
        // Just log the error
    }
}

/**
 * Upload multiple files to S3 with rollback on failure
 * If any upload fails, previously uploaded files are deleted
 * @param uploads - Array of upload parameters
 * @returns Array of S3 keys in the same order as input
 */
export async function uploadMultipleToS3(uploads: UploadToS3Params[]): Promise<string[]> {
    const uploadedKeys: string[] = [];

    try {
        for (const upload of uploads) {
            const result = await uploadToS3(upload);
            uploadedKeys.push(result.key);
        }

        return uploadedKeys;
    } catch (error) {
        // Rollback: delete all successfully uploaded files
        logger.warn(`Upload failed, rolling back ${uploadedKeys.length} uploaded files`);

        for (const key of uploadedKeys) {
            await deleteFromS3(key);
        }

        throw error;
    }
}

/**
 * Generate a presigned URL for accessing a private S3 object
 * @param key - S3 object key
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Presigned URL for the object
 */
export async function getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
        const command = new GetObjectCommand({
            Bucket: env.S3_BUCKET_NAME,
            Key: key,
        });

        const url = await getSignedUrl(s3Client, command, {  expiresIn });
        
        logger.debug(`Generated presigned URL for key: ${key}`);
        
        return url;
    } catch (error) {
        logger.error("Failed to generate presigned URL:", error);
        throw new Error(`Presigned URL generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
