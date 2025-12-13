import { UserRepository } from "@/repository/user.repository";
import IUser from "@/core/interface/model/IUser.model";
import logger from "@/utils/logger.utils";

export interface FindOrCreateUserResult {
    success: boolean;
    message: string;
    user?: {
        id: string;
        phoneNumber: string;
        role: string;
        name?: string;
        email?: string;
    };
}

export class UserService {
    constructor(
        private readonly userRepo = new UserRepository()
    ) { }

    /**
     * Find existing user by phone number or create new user
     * Used during OTP verification flow
     * @param phoneNumber - User's phone number
     * @returns User information with database ID
     */
    async findOrCreateUser(phoneNumber: string): Promise<FindOrCreateUserResult> {
        try {
            logger.info(`Finding or creating user for phone: ${phoneNumber}`);

            const user = await this.userRepo.findOrCreateByPhoneNumber(phoneNumber);

            logger.info(`User ${user._id} found/created for phone: ${phoneNumber}`);

            return {
                success: true,
                message: "User retrieved successfully",
                user: {
                    id: user._id.toString(),
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    name: user.name,
                    email: user.email,
                },
            };
        } catch (error) {
            logger.error("Failed to find/create user:", error);
            return {
                success: false,
                message: `Failed to process user: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }

    /**
     * Get user by ID
     * @param userId - User's database ID
     * @returns User information
     */
    async getUserById(userId: string) {
        try {
            const user = await this.userRepo.findByUserId(userId);

            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                };
            }

            return {
                success: true,
                message: "User retrieved successfully",
                user: {
                    id: user._id.toString(),
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    name: user.name,
                    email: user.email,
                    isBlocked: user.isBlocked,
                },
            };
        } catch (error) {
            logger.error("Failed to get user:", error);
            return {
                success: false,
                message: `Failed to retrieve user: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
}
