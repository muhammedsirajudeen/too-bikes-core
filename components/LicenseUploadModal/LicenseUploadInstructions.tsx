import { AlertCircle } from "lucide-react";

export function LicenseUploadInstructions() {
    return (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                        Upload Guidelines
                    </h3>
                    <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                        <li>• Ensure the license is clearly visible and readable</li>
                        <li>• Accepted formats: JPEG, PNG, or PDF</li>
                        <li>• Maximum file size: 5MB per file</li>
                        <li>• Avoid blurry or dark images</li>
                        <li>• Make sure all text and details are legible</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
