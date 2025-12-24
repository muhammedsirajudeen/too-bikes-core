"use client";

import { useState } from "react";
import { VehicleForm, VehicleFormValues } from "./VehicleForm";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Vehicle {
    _id: string;
    store: string | { _id: string, name: string };
    name: string;
    description?: string;
    brand: string;
    modelYear?: number;
    fuelType: "petrol" | "diesel" | "electric";
    pricePerHour: number;
    pricePerDay?: number;
    mileage?: number;
    licensePlate: string;
    image?: { key: string; url: string }[];
    isActive: boolean;
}

interface StoreOption {
    _id: string;
    name: string;
}

interface VehicleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "edit";
    vehicle?: Vehicle;
    stores: StoreOption[];
    onSuccess: () => void;
}

export function VehicleDialog({ open, onOpenChange, mode, vehicle, stores, onSuccess }: VehicleDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (values: VehicleFormValues) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('admin_access_token');
            if (!token) {
                throw new Error("Not authenticated");
            }

            const url = mode === "create"
                ? "/api/v1/admin/vehicles"
                : `/api/v1/admin/vehicles/${vehicle?._id}`;

            const method = mode === "create" ? "POST" : "PUT";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...values,
                    image: values.image?.map(img => img.key) || []
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to save vehicle");
            }

            onSuccess();
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const defaultValues = vehicle ? {
        store: typeof vehicle.store === 'string' ? vehicle.store : vehicle.store._id,
        name: vehicle.name,
        description: vehicle.description || "",
        brand: vehicle.brand,
        modelYear: vehicle.modelYear,
        fuelType: vehicle.fuelType,
        pricePerHour: vehicle.pricePerHour,
        pricePerDay: vehicle.pricePerDay || 0,
        mileage: vehicle.mileage || 0,
        licensePlate: vehicle.licensePlate,
        isActive: vehicle.isActive,
        image: vehicle.image || [],
    } : undefined;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" ? "Add New Vehicle" : "Edit Vehicle"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create"
                            ? "Fill in the details to add a new vehicle."
                            : "Update the vehicle information below."}
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <VehicleForm
                    mode={mode}
                    defaultValues={defaultValues}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    stores={stores}
                />
            </DialogContent>
        </Dialog>
    );
}
