import { BaseRepository } from "./base.respository";
import UserFavoriteModel from "@/model/user.favorite.model";
import { Document, Types } from "mongoose";

interface IUserFavorite extends Document {
    userId: Types.ObjectId;
    vehicleId: Types.ObjectId;
}

export class UserFavoriteRepository extends BaseRepository<IUserFavorite> {
    constructor() {
        super(UserFavoriteModel as any);
    }

    /**
     * Add a vehicle to user's favorites
     * @param userId - User's database ID
     * @param vehicleId - Vehicle's database ID
     * @returns Created favorite document
     */
    async addFavorite(userId: string, vehicleId: string): Promise<IUserFavorite> {
        // Check if already exists
        const existing = await this.findOne({
            userId: new Types.ObjectId(userId),
            vehicleId: new Types.ObjectId(vehicleId)
        });

        if (existing) {
            return existing;
        }

        return this.create({
            userId: new Types.ObjectId(userId),
            vehicleId: new Types.ObjectId(vehicleId)
        } as Partial<IUserFavorite>);
    }

    /**
     * Remove a vehicle from user's favorites
     * @param userId - User's database ID
     * @param vehicleId - Vehicle's database ID
     */
    async removeFavorite(userId: string, vehicleId: string): Promise<void> {
        await this.deleteOne({
            userId: new Types.ObjectId(userId),
            vehicleId: new Types.ObjectId(vehicleId)
        });
    }

    /**
     * Check if a vehicle is favorited by a user
     * @param userId - User's database ID
     * @param vehicleId - Vehicle's database ID
     * @returns True if favorited, false otherwise
     */
    async isFavorite(userId: string, vehicleId: string): Promise<boolean> {
        const favorite = await this.findOne({
            userId: new Types.ObjectId(userId),
            vehicleId: new Types.ObjectId(vehicleId)
        });
        return !!favorite;
    }

    /**
     * Get all favorite vehicles for a user
     * @param userId - User's database ID
     * @returns Array of favorite documents with populated vehicle details
     */
    async getUserFavorites(userId: string): Promise<IUserFavorite[]> {
        return this.model.find({
            userId: new Types.ObjectId(userId)
        }).populate('vehicleId');
    }

    /**
     * Count total favorites for a user
     * @param userId - User's database ID
     * @returns Total count of favorites
     */
    async countUserFavorites(userId: string): Promise<number> {
        return this.model.countDocuments({
            userId: new Types.ObjectId(userId)
        });
    }

    /**
     * Get paginated favorite vehicles for a user
     * @param userId - User's database ID
     * @param skip - Number of documents to skip
     * @param limit - Number of documents to return
     * @returns Array of favorite documents with populated vehicle details
     */
    async getUserFavoritesPaginated(userId: string, skip: number, limit: number): Promise<IUserFavorite[]> {
        return this.model.find({
            userId: new Types.ObjectId(userId)
        })
            .populate('vehicleId')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Most recent first
    }
}
