"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadState {
    key: string;
    url: string;
}

interface ImageUploadProps {
    value: ImageUploadState[];
    onChange: (value: ImageUploadState[]) => void;
    onRemove: (key: string) => void;
    disabled?: boolean;
}

export function ImageUpload({ value, onChange, onRemove, disabled }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const uploadedImages: ImageUploadState[] = [];

        try {
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/v1/admin/upload", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
                    },
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error("Upload failed");
                }

                const data = await response.json();
                if (data.success) {
                    uploadedImages.push({
                        key: data.data.key,
                        url: data.data.url
                    });
                } else {
                    throw new Error(data.message || "Upload failed");
                }
            }

            onChange([...value, ...uploadedImages]);
            toast.success("Images uploaded successfully");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload images");
        } finally {
            setIsUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="mb-4 flex flex-wrap gap-4">
                {value.map((image) => (
                    <div key={image.key} className="relative h-[200px] w-[200px] rounded-md overflow-hidden border border-gray-200">
                        <div className="z-10 absolute top-2 right-2">
                            <Button
                                type="button"
                                onClick={() => onRemove(image.key)}
                                variant="destructive"
                                size="icon"
                                className="h-6 w-6"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="relative h-full w-full bg-gray-100">
                            {image.url ? (
                                <Image
                                    src={image.url}
                                    alt="Vehicle Image"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                    <ImageIcon className="h-8 w-8" />
                                    <span className="text-xs ml-2 break-all p-2">{image.key.split('/').pop()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <Button
                    type="button"
                    variant="secondary"
                    disabled={disabled || isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Images
                        </>
                    )}
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onUpload}
                    className="hidden"
                    accept="image/*"
                    multiple
                />
            </div>
        </div>
    );
}
