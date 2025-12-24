// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { ImageUpload } from "./ImageUpload";

const vehicleFormSchema = z.object({
    store: z.string().min(1, "Store is required"),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    brand: z.string().min(1, "Brand is required"),
    modelYear: z.number().optional(),
    fuelType: z.enum(["petrol", "diesel", "electric"]),
    pricePerHour: z.number().min(0, "Price must be positive"),
    pricePerDay: z.number().optional(),
    mileage: z.number().optional(),
    licensePlate: z.string().min(1, "License plate is required"),
    image: z.array(z.object({
        key: z.string(),
        url: z.string()
    })).optional(),
    isActive: z.boolean().default(true),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

interface StoreOption {
    _id: string;
    name: string;
}

interface VehicleFormProps {
    mode: "create" | "edit";
    defaultValues?: Partial<VehicleFormValues>;
    onSubmit: (values: VehicleFormValues) => void | Promise<void>;
    isSubmitting?: boolean;
    stores: StoreOption[];
}

export function VehicleForm({ mode, defaultValues, onSubmit, isSubmitting = false, stores }: VehicleFormProps) {
    const form = useForm<VehicleFormValues>({
        // @ts-expect-error - Resolver types mismatch with zod default
        resolver: zodResolver(vehicleFormSchema),
        defaultValues: {
            store: defaultValues?.store || "",
            name: defaultValues?.name || "",
            description: defaultValues?.description || "",
            brand: defaultValues?.brand || "",
            modelYear: defaultValues?.modelYear,
            fuelType: defaultValues?.fuelType || "petrol",
            pricePerHour: defaultValues?.pricePerHour || 0,
            pricePerDay: defaultValues?.pricePerDay || 0,
            mileage: defaultValues?.mileage || 0,
            licensePlate: defaultValues?.licensePlate || "",
            image: defaultValues?.image || [],
            isActive: defaultValues?.isActive ?? true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
    });

    return (
        <Form {...form}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <form onSubmit={form.handleSubmit((data: any) => onSubmit(data))} className="space-y-4">
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Images</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    value={field.value || []}
                                    onChange={field.onChange}
                                    onRemove={(key) => field.onChange(field.value?.filter((current) => current.key !== key) || [])}
                                    disabled={isSubmitting}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="store"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Store</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a store" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {stores.map((store) => (
                                        <SelectItem key={store._id} value={store._id}>
                                            {store.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Brand</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Honda" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Model Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Activa 6G" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Vehicle details..."
                                    className="resize-none"
                                    rows={2}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="licensePlate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>License Plate</FormLabel>
                                <FormControl>
                                    <Input placeholder="XX-00-XX-0000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="fuelType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fuel Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select fuel type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="petrol">Petrol</SelectItem>
                                        <SelectItem value="diesel">Diesel</SelectItem>
                                        <SelectItem value="electric">Electric</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="pricePerHour"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price/Hour (₹)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="pricePerDay"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price/Day (₹)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="modelYear"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Year</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="2024"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Active Status
                                </FormLabel>
                                <FormDescription>
                                    This vehicle will be visible to users when active.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : mode === "create" ? "Add Vehicle" : "Update Vehicle"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
