// File validation utilities for license upload

export interface FileValidationResult {
    isValid: boolean;
    error?: string;
}

// Allowed file types
export const ALLOWED_FILE_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'application/pdf': ['.pdf'],
} as const;

// Maximum file size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

/**
 * Validates if a file meets the requirements for license upload
 * @param file - The file to validate
 * @returns FileValidationResult with validation status and error message if invalid
 */
export function validateLicenseFile(file: File): FileValidationResult {
    // Check file type
    const allowedTypes = Object.keys(ALLOWED_FILE_TYPES);
    if (!allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: 'Please upload a valid file (JPEG, PNG, or PDF)',
        };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
        return {
            isValid: false,
            error: `File size should be less than ${sizeMB}MB`,
        };
    }

    return { isValid: true };
}

/**
 * Converts a file to a data URL for preview
 * @param file - The file to convert
 * @returns Promise that resolves to the data URL
 */
export function fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Gets the accept attribute value for file inputs
 * @returns Comma-separated list of accepted file types
 */
export function getAcceptedFileTypes(): string {
    return Object.keys(ALLOWED_FILE_TYPES).join(',');
}

/**
 * Formats file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
