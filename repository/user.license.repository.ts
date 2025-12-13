import { BaseRepository } from "./base.respository";
import userLicenseModel from "@/model/user.license.model";
import { Document, Types } from "mongoose";

export interface IUserLicense extends Document {
    userId: Types.ObjectId; // Reference to User model
    frontImage: string;
    backImage: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class UserLicenseRepository extends BaseRepository<IUserLicense> {
    constructor() {
        super(userLicenseModel as any); // Type assertion to resolve Mongoose type mismatch
    }

    /**
     * Find license by user ID
     * @param userId - User's ObjectId
     * @returns User license document or null
     */
    async findByUserId(userId: Types.ObjectId): Promise<IUserLicense | null> {
        return this.findOne({ userId });
    }

    /**
     * Create a new license record
     * @param userId - User's ObjectId
     * @param frontImageKey - S3 key for front image
     * @param backImageKey - S3 key for back image
     * @returns Created license document
     */
    async createLicense(
        userId: Types.ObjectId,
        frontImageKey: string,
        backImageKey: string
    ): Promise<IUserLicense> {
        return this.create({
            userId,
            frontImage: frontImageKey,
            backImage: backImageKey,
        } as Partial<IUserLicense>);
    }

    /**
     * Update an existing license record
     * @param userId - User's ObjectId
     * @param frontImageKey - S3 key for front image
     * @param backImageKey - S3 key for back image
     * @returns Updated license document or null
     */
    async updateLicense(
        userId: Types.ObjectId,
        frontImageKey: string,
        backImageKey: string
    ): Promise<IUserLicense | null> {
        return this.model.findOneAndUpdate(
            { userId },
            {
                frontImage: frontImageKey,
                backImage: backImageKey,
            },
            { new: true }
        );
    }

    /**
     * Create or update license (upsert operation)
     * @param userId - User's ObjectId
     * @param frontImageKey - S3 key for front image
     * @param backImageKey - S3 key for back image
     * @returns License document
     */
    async upsertLicense(
        userId: Types.ObjectId,
        frontImageKey: string,
        backImageKey: string
    ): Promise<IUserLicense> {
        const result = await this.model.findOneAndUpdate(
            { userId },
            {
                frontImage: frontImageKey,
                backImage: backImageKey,
            },
            { new: true, upsert: true }
        );

        return result as IUserLicense;
    }
}
