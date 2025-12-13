import { BaseRepository } from "./base.respository";
import { UserModel } from "@/model/user.model";
import IUser from "@/core/interface/model/IUser.model";

export class UserRepository extends BaseRepository<IUser> {
    constructor() {
        super(UserModel as any); // Type assertion for Mongoose compatibility
    }

    /**
     * Find user by phone number
     * @param phoneNumber - User's phone number
     * @returns User document or null
     */
    async findByPhoneNumber(phoneNumber: string): Promise<IUser | null> {
        return this.findOne({ phoneNumber });
    }

    /**
     * Create a new user with phone number
     * @param phoneNumber - User's phone number
     * @param role - User role (default: "client")
     * @returns Created user document
     */
    async createUser(
        phoneNumber: string,
        role: "client" | "trainer" | "admin" = "client"
    ): Promise<IUser> {
        return this.create({
            phoneNumber,
            role,
            isBlocked: false,
        } as Partial<IUser>);
    }

    /**
     * Find user by phone number or create if not exists
     * @param phoneNumber - User's phone number
     * @returns User document (existing or newly created)
     */
    async findOrCreateByPhoneNumber(phoneNumber: string): Promise<IUser> {
        let user = await this.findByPhoneNumber(phoneNumber);

        if (!user) {
            user = await this.createUser(phoneNumber);
        }

        return user;
    }

    /**
     * Find user by ID
     * @param userId - User's database ID
     * @returns User document or null
     */
    async findByUserId(userId: string): Promise<IUser | null> {
        return this.findById(userId as any);
    }
}
