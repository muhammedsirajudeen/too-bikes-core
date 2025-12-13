import { Upload, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface LicenseUploadSectionProps {
    side: "front" | "back";
    preview: string;
    onUploadClick: () => void;
    onCameraClick: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    cameraInputRef: React.RefObject<HTMLInputElement | null>;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    acceptedTypes: string;
}

export function LicenseUploadSection({
    side,
    preview,
    onUploadClick,
    onCameraClick,
    fileInputRef,
    cameraInputRef,
    onFileChange,
    acceptedTypes,
}: LicenseUploadSectionProps) {
    const sideLabel = side === "front" ? "Front side" : "Back side";

    return (
        <div className="mb-6">
            <label className="text-sm font-semibold text-[#0B0B0B] dark:text-gray-300 mb-3 block">
                {sideLabel}
            </label>

            {/* Preview/Upload Area */}
            <div
                className={cn(
                    "w-full h-[180px] rounded-2xl border-2 border-dashed mb-3 flex items-center justify-center overflow-hidden",
                    preview
                        ? "border-[#F4AA05] bg-[#FFF8E7] dark:bg-[#2A2416]"
                        : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#20222F]"
                )}
            >
                {preview ? (
                    <div className="relative w-full h-full">
                        <Image
                            src={preview}
                            alt={`${sideLabel} of license`}
                            fill
                            className="object-contain"
                        />
                    </div>
                ) : (
                    <div className="text-center px-4">
                        <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Please upload or take a photo of the {side} side.
                        </p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Button
                    type="button"
                    onClick={onUploadClick}
                    className="flex-1 bg-white dark:bg-[#20222F] text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#252836] font-medium py-3 rounded-lg h-12"
                >
                    Upload
                </Button>
                <Button
                    type="button"
                    onClick={onCameraClick}
                    className="flex-1 bg-[#1F1D2B] dark:bg-[#252836] text-white hover:bg-[#2A2838] dark:hover:bg-[#2D2B3D] font-medium py-3 rounded-lg h-12 flex items-center justify-center gap-2"
                >
                    <Camera className="w-5 h-5" />
                    Camera
                </Button>
            </div>

            {/* Hidden file inputs */}
            <input
                ref={fileInputRef}
                type="file"
                accept={acceptedTypes}
                onChange={onFileChange}
                className="hidden"
            />
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onFileChange}
                className="hidden"
            />
        </div>
    );
}
