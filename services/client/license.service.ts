import axiosInstance from "@/lib/axios";

export interface CheckLicenseResponse {
    success: boolean;
    message: string;
    hasLicense: boolean;
    error?: string;
}

/**
 * Check if the authenticated user has uploaded their license
 * @returns Promise with license check result
 */
export async function checkUserLicense(): Promise<CheckLicenseResponse> {
    try {
        const response = await axiosInstance.get<CheckLicenseResponse>("/api/v1/license/check");
        return response.data;
    } catch (error) {
        console.error("Failed to check license:", error);
        return {
            success: false,
            message: "Failed to check license status",
            hasLicense: false,
        };
    }
}
