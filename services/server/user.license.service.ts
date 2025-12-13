import { uploadMultipleToS3, deleteFromS3 } from "@/utils/s3.utils";
import { UserLicenseRepository } from "@/repository/user.license.repository";
import { Types } from "mongoose";
import logger from "@/utils/logger.utils";

export interface UploadLicenseParams {
    userId: string;
    frontImageBuffer: Buffer;
    frontImageName: string;
    frontImageType: string;
    backImageBuffer: Buffer;
    backImageName: string;
    backImageType: string;
}

export interface UploadLicenseResult {
    success: boolean;
    message: string;
    licenseId?: string;
}

export class UserLicenseService {
    constructor(
        private readonly licenseRepo = new UserLicenseRepository()
    ) { }

    /**
     * Upload license images to S3 and save to database
     * Implements transaction-like behavior with rollback on failure
     */
    async uploadLicense(params: UploadLicenseParams): Promise<UploadLicenseResult> {
        const {
            userId,
            frontImageBuffer,
            frontImageName,
            frontImageType,
            backImageBuffer,
            backImageName,
            backImageType,
        } = params;

        // Validate file types
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(frontImageType) || !allowedTypes.includes(backImageType)) {
            return {
                success: false,
                message: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
            };
        }

        // Validate file sizes (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (frontImageBuffer.length > maxSize || backImageBuffer.length > maxSize) {
            return {
                success: false,
                message: "File size exceeds 5MB limit.",
            };
        }

        let frontImageKey: string | null = null;
        let backImageKey: string | null = null;

        try {
            // Check if user already has a license
            const userObjectId = new Types.ObjectId(userId);
            const existingLicense = await this.licenseRepo.findByUserId(userObjectId);

            // Upload both images to S3 with automatic rollback on failure
            logger.info(`Uploading license images for user ${userId}`);

            const [frontKey, backKey] = await uploadMultipleToS3([
                {
                    fileBuffer: frontImageBuffer,
                    fileName: frontImageName,
                    contentType: frontImageType,
                    userId,
                },
                {
                    fileBuffer: backImageBuffer,
                    fileName: backImageName,
                    contentType: backImageType,
                    userId,
                },
            ]);

            frontImageKey = frontKey;
            backImageKey = backKey;

            // Save S3 keys to database (upsert - create or update)
            const license = await this.licenseRepo.upsertLicense(
                userObjectId,
                frontImageKey,
                backImageKey
            );

            // If there was an existing license, delete the old images from S3
            if (existingLicense) {
                logger.info(`Deleting old license images for user ${userId}`);
                try {
                    await deleteFromS3(existingLicense.frontImage);
                    await deleteFromS3(existingLicense.backImage);
                    logger.info(`Old license images deleted successfully`);
                } catch (deleteError) {
                    // Log error but don't fail the operation since new license is already saved
                    logger.error("Failed to delete old license images:", deleteError);
                }
            }

            logger.info(`License uploaded successfully for user ${userId}, license ID: ${license._id}`);

            return {
                success: true,
                message: existingLicense ? "License updated successfully" : "License uploaded successfully",
                licenseId: license._id.toString(),
            };
        } catch (error) {
            logger.error("Failed to upload license:", error);

            // Cleanup: If database save failed but S3 upload succeeded, delete from S3
            if (frontImageKey) {
                await deleteFromS3(frontImageKey);
            }
            if (backImageKey) {
                await deleteFromS3(backImageKey);
            }

            return {
                success: false,
                message: `Failed to upload license: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }

    /**
     * Get user's license information
     */
    async getUserLicense(userId: string) {
        try {
            const userObjectId = new Types.ObjectId(userId);
            const license = await this.licenseRepo.findByUserId(userObjectId);

            if (!license) {
                return {
                    success: false,
                    message: "License not found",
                };
            }

            return {
                success: true,
                message: "License retrieved successfully",
                data: {
                    frontImage: license.frontImage,
                    backImage: license.backImage,
                },
            };
        } catch (error) {
            logger.error("Failed to get user license:", error);
            return {
                success: false,
                message: `Failed to retrieve license: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
}
