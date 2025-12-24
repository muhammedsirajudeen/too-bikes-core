"use client";

import { useState } from "react";
import { StoreForm, StoreFormValues } from "./StoreForm";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Store {
    _id: string;
    name: string;
    description?: string;
    address: string;
    district: string;
    latitude?: number;
    longitude?: number;
    openingTime: string;
    closingTime: string;
    contactNumber?: string;
}

interface StoreDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "edit";
    store?: Store;
    onSuccess: () => void;
}

export function StoreDialog({ open, onOpenChange, mode, store, onSuccess }: StoreDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (values: StoreFormValues) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('admin_access_token');
            if (!token) {
                throw new Error("Not authenticated");
            }

            const url = mode === "create"
                ? "/api/v1/admin/stores"
                : `/api/v1/admin/stores/${store?._id}`;

            const method = mode === "create" ? "POST" : "PUT";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to save store");
            }

            onSuccess();
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const defaultValues = store ? {
        name: store.name,
        description: store.description || "",
        address: store.address,
        district: store.district,
        latitude: store.latitude || 0,
        longitude: store.longitude || 0,
        openingTime: store.openingTime,
        closingTime: store.closingTime,
        contactNumber: store.contactNumber || "",
    } : undefined;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" ? "Add New Store" : "Edit Store"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create"
                            ? "Fill in the details to create a new store."
                            : "Update the store information below."}
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <StoreForm
                    mode={mode}
                    defaultValues={defaultValues}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            </DialogContent>
        </Dialog>
    );
}
