"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LicenseUploadSection } from "./LicenseUploadSection";
import { LicenseUploadInstructions } from "./LicenseUploadInstructions";
import {
    validateLicenseFile,
    fileToDataURL,
    getAcceptedFileTypes,
} from "@/utils/fileValidation.utils";

interface LicenseUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (frontImage: File, backImage: File) => void;
}

export default function LicenseUploadModal({
    isOpen,
    onClose,
    onComplete,
}: LicenseUploadModalProps) {
    const [frontImage, setFrontImage] = useState<File | null>(null);
    const [backImage, setBackImage] = useState<File | null>(null);
    const [frontPreview, setFrontPreview] = useState<string>("");
    const [backPreview, setBackPreview] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const frontFileInputRef = useRef<HTMLInputElement>(null);
    const backFileInputRef = useRef<HTMLInputElement>(null);
    const frontCameraInputRef = useRef<HTMLInputElement>(null);
    const backCameraInputRef = useRef<HTMLInputElement>(null);

    const acceptedTypes = getAcceptedFileTypes();

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setFrontImage(null);
            setBackImage(null);
            setFrontPreview("");
            setBackPreview("");
            setError("");
            setIsSubmitting(false);
        }
    }, [isOpen]);

    // Handle file selection
    const handleFileSelect = async (file: File, side: "front" | "back") => {
        const validation = validateLicenseFile(file);

        if (!validation.isValid) {
            setError(validation.error || "Invalid file");
            return;
        }

        setError("");

        try {
            const preview = await fileToDataURL(file);
            if (side === "front") {
                setFrontImage(file);
                setFrontPreview(preview);
            } else {
                setBackImage(file);
                setBackPreview(preview);
            }
        } catch (_err) {
            setError("Failed to process the file. Please try again.");
        }
    };

    // Handle upload button click
    const handleUploadClick = (side: "front" | "back") => {
        if (side === "front") {
            frontFileInputRef.current?.click();
        } else {
            backFileInputRef.current?.click();
        }
    };

    // Handle camera button click
    const handleCameraClick = (side: "front" | "back") => {
        if (side === "front") {
            frontCameraInputRef.current?.click();
        } else {
            backCameraInputRef.current?.click();
        }
    };

    // Handle file input change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file, side);
        }
    };

    // Handle submit
    const handleSubmit = async () => {
        if (!frontImage || !backImage) {
            setError("Please upload both front and back photos of your license");
            return;
        }

        // Check total file size (both images combined should be under 5MB)
        const totalSize = frontImage.size + backImage.size;
        const maxTotalSize = 5 * 1024 * 1024; // 5MB in bytes

        if (totalSize > maxTotalSize) {
            const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
            setError(`Total file size (${totalSizeMB}MB) exceeds the 5MB limit. Please compress your images or use smaller files.`);
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            // Get access token from localStorage
            const token = localStorage.getItem("auth_token");

            if (!token) {
                setError("You must be logged in to upload your license");
                setIsSubmitting(false);
                return;
            }

            // Create FormData for multipart upload
            const formData = new FormData();
            formData.append("frontImage", frontImage);
            formData.append("backImage", backImage);

            // Call the API
            const response = await fetch("/api/v1/license/upload", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Success - call onComplete callback
                onComplete(frontImage, backImage);
            } else if (response.status === 413) {
                // Handle 413 Payload Too Large specifically
                setError("Files are too large. Please ensure both images combined are under 5MB.");
            } else {
                // API returned an error
                setError(data.message || "Failed to upload license. Please try again.");
            }
        } catch (error) {
            console.error("License upload error:", error);
            setError("An error occurred while uploading. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle close
    const handleClose = () => {
        setFrontImage(null);
        setBackImage(null);
        setFrontPreview("");
        setBackPreview("");
        setError("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Drawer
            open={isOpen}
            onOpenChange={(open) => !open && handleClose()}
            dismissible={true}
        >
            <DrawerContent
                className={cn(
                    "max-w-[430px] mx-auto",
                    "bg-white dark:bg-[#191B27] rounded-t-[20px]",
                    "p-0 gap-0",
                    "focus:outline-none"
                )}
            >
                <div className="relative w-full bg-white dark:bg-[#191B27] rounded-t-[20px] flex flex-col max-h-[90vh]">
                    {/* Close Button */}
                    <DrawerClose
                        onClick={handleClose}
                        className={cn(
                            "absolute top-4 right-4 w-6 h-6 rounded-full z-20",
                            "text-[#99A1AF] hover:text-gray-600 dark:hover:text-gray-300",
                            "transition-colors focus:outline-none"
                        )}
                    >
                        <X className="w-full h-full" />
                        <span className="sr-only">Close</span>
                    </DrawerClose>

                    {/* Scrollable Content */}
                    <div className="px-6 pt-6 pb-24 overflow-y-auto min-h-0">
                        {/* Header */}
                        <div className="mb-4">
                            <DrawerTitle asChild>
                                <h2 className="text-2xl font-semibold text-[#111111] dark:text-white mb-2">
                                    Upload Your License
                                </h2>
                            </DrawerTitle>
                            <p className="text-[15px] font-normal text-black/75 dark:text-gray-400">
                                Add both front and back photos of your driving license to proceed.
                            </p>
                        </div>

                        {/* Instructions */}
                        <LicenseUploadInstructions />

                        {/* Front Side Upload */}
                        <LicenseUploadSection
                            side="front"
                            preview={frontPreview}
                            onUploadClick={() => handleUploadClick("front")}
                            onCameraClick={() => handleCameraClick("front")}
                            fileInputRef={frontFileInputRef}
                            cameraInputRef={frontCameraInputRef}
                            onFileChange={(e) => handleFileChange(e, "front")}
                            acceptedTypes={acceptedTypes}
                        />

                        {/* Back Side Upload */}
                        <LicenseUploadSection
                            side="back"
                            preview={backPreview}
                            onUploadClick={() => handleUploadClick("back")}
                            onCameraClick={() => handleCameraClick("back")}
                            fileInputRef={backFileInputRef}
                            cameraInputRef={backCameraInputRef}
                            onFileChange={(e) => handleFileChange(e, "back")}
                            acceptedTypes={acceptedTypes}
                        />

                        {/* Error Message */}
                        {error && (
                            <p className="text-sm text-red-500 text-center mb-4 animate-in slide-in-from-top-1">
                                {error}
                            </p>
                        )}

                        {/* Upload Button */}
                        <Button
                            onClick={handleSubmit}
                            disabled={!frontImage || !backImage || isSubmitting}
                            className="w-full mb-12 bg-[#F4AA05] hover:bg-[#cf9002] text-white font-semibold text-lg px-8 py-6 rounded-full shadow-lg shadow-orange-500/20 h-14 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Uploading..." : "Upload & Continue"}
                        </Button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
