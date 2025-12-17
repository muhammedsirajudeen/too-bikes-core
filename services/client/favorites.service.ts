import axiosInstance from "@/lib/axios";
import { FavoriteActionResponse } from "@/app/api/v1/user/favorites/[vehicleId]/route";
import { GetFavoritesResponse } from "@/app/api/v1/user/favorites/route";

/**
 * Add a vehicle to user's favorites
 * @param vehicleId - Vehicle's database ID
 * @returns Response with favorite status
 */
export async function addToFavorites(vehicleId: string): Promise<FavoriteActionResponse> {
    try {
        const response = await axiosInstance.post<FavoriteActionResponse>(
            `/api/v1/user/favorites/${vehicleId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error adding to favorites:", error);
        throw error;
    }
}

/**
 * Remove a vehicle from user's favorites
 * @param vehicleId - Vehicle's database ID
 * @returns Response with favorite status
 */
export async function removeFromFavorites(vehicleId: string): Promise<FavoriteActionResponse> {
    try {
        const response = await axiosInstance.delete<FavoriteActionResponse>(
            `/api/v1/user/favorites/${vehicleId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error removing from favorites:", error);
        throw error;
    }
}

/**
 * Check if a vehicle is in user's favorites
 * @param vehicleId - Vehicle's database ID
 * @returns Response with favorite status
 */
export async function checkFavoriteStatus(vehicleId: string): Promise<FavoriteActionResponse> {
    try {
        const response = await axiosInstance.get<FavoriteActionResponse>(
            `/api/v1/user/favorites/${vehicleId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error checking favorite status:", error);
        throw error;
    }
}

/**
 * Get all favorite vehicles for the authenticated user
 * @returns Response with list of favorite vehicles
 */
export async function getAllFavorites(): Promise<GetFavoritesResponse> {
    try {
        const response = await axiosInstance.get<GetFavoritesResponse>(
            `/api/v1/user/favorites`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching favorites:", error);
        throw error;
    }
}
