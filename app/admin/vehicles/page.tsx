"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Bike, Search } from "lucide-react";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { VehicleDialog } from "@/components/VehicleForm/VehicleDialog";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDebounce } from "@/hooks/useDebounce";
import AdminLayout from "@/components/AdminLayout";

interface Vehicle {
    _id: string;
    store: string | { _id: string; name: string };
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

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [stores, setStores] = useState<StoreOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

    // Search/Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const [filterStore, setFilterStore] = useState<string>("all");
    const [filterFuelType, setFilterFuelType] = useState<string>("all");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalVehicles, setTotalVehicles] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchData();
    }, []);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, filterStore, filterFuelType]);

    // Fetch vehicles when page OR filters change
    useEffect(() => {
        fetchVehicles();
    }, [currentPage, debouncedSearchQuery, filterStore, filterFuelType]);

    const fetchData = async () => {
        await Promise.all([fetchStores(), fetchVehicles()]);
    };

    const fetchStores = async () => {
        try {
            const token = localStorage.getItem('admin_access_token');
            const response = await fetch('/api/v1/admin/stores?page=1&limit=1000', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setStores(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stores:', error);
        }
    };

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_access_token');

            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
            });

            if (filterStore !== 'all') params.append('store', filterStore);
            if (filterFuelType !== 'all') params.append('fuelType', filterFuelType);
            if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);

            const response = await fetch(`/api/v1/admin/vehicles?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setVehicles(data.data);
                if (data.pagination) {
                    setTotalPages(data.pagination.totalPages);
                    setTotalVehicles(data.pagination.total);
                }
            } else {
                toast.error("Failed to load vehicles");
            }
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
            toast.error("Failed to load vehicles");
        } finally {
            setLoading(false);
        }
    };

    const handleAddVehicle = () => {
        setDialogMode("create");
        setSelectedVehicle(undefined);
        setDialogOpen(true);
    };

    const handleEditVehicle = (vehicle: Vehicle) => {
        setDialogMode("edit");
        setSelectedVehicle(vehicle);
        setDialogOpen(true);
    };

    const handleDeleteClick = (vehicleId: string) => {
        setVehicleToDelete(vehicleId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!vehicleToDelete) return;

        try {
            const token = localStorage.getItem('admin_access_token');
            const response = await fetch(`/api/v1/admin/vehicles/${vehicleToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                toast.success("Vehicle deleted successfully");
                fetchVehicles();
            } else {
                toast.error(data.message || "Failed to delete vehicle");
            }
        } catch (error) {
            console.error('Failed to delete vehicle:', error);
            toast.error("Failed to delete vehicle");
        } finally {
            setDeleteDialogOpen(false);
            setVehicleToDelete(null);
        }
    };

    const handleDialogSuccess = () => {
        fetchVehicles();
        toast.success(dialogMode === "create" ? "Vehicle added successfully" : "Vehicle updated successfully");
    };

    const getStoreName = (store: string | { _id: string; name: string }) => {
        if (typeof store === 'string') {
            const foundStore = stores.find(s => s._id === store);
            return foundStore?.name || store;
        }
        return store.name;
    };

    return (
        <AdminLayout pageTitle="Vehicle Management" pageSubtitle="Workspace">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Vehicles</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage all vehicles in your fleet.
                        </p>
                    </div>
                    <Button
                        onClick={handleAddVehicle}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Vehicle
                    </Button>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search by vehicle name, brand, or license plate..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        value={filterStore}
                        onChange={(e) => setFilterStore(e.target.value)}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-white w-full lg:w-[200px]"
                    >
                        <option value="all">All Stores</option>
                        {stores.map(store => (
                            <option key={store._id} value={store._id}>{store.name}</option>
                        ))}
                    </select>
                    <select
                        value={filterFuelType}
                        onChange={(e) => setFilterFuelType(e.target.value)}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-white w-full lg:w-[200px]"
                    >
                        <option value="all">All Fuel Types</option>
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="electric">Electric</option>
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">Loading vehicles...</p>
                    </div>
                ) : vehicles.length === 0 ? (
                    <div className="bg-white dark:bg-[#1e1e3f] rounded-xl p-12 border border-gray-200 dark:border-gray-800 text-center">
                        <Bike className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No vehicles yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Get started by adding your first vehicle to the fleet.
                        </p>
                        <Button onClick={handleAddVehicle}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Vehicle
                        </Button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#1e1e3f] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-[#0f0f23] border-b border-gray-200 dark:border-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Vehicle
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Store
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            License Plate
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Pricing
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {vehicles.map((vehicle) => (
                                        <tr key={vehicle._id} className="hover:bg-gray-50 dark:hover:bg-[#0f0f23]">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {vehicle.brand} {vehicle.name}
                                                </div>
                                                {vehicle.modelYear && (
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {vehicle.modelYear}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {getStoreName(vehicle.store)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    {vehicle.fuelType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white font-mono">
                                                    {vehicle.licensePlate}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    ₹{vehicle.pricePerHour}/hr
                                                    {vehicle.pricePerDay && ` • ₹${vehicle.pricePerDay}/day`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    vehicle.isActive 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                                }`}>
                                                    {vehicle.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEditVehicle(vehicle)}
                                                        className="h-8 w-8"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteClick(vehicle._id)}
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="px-6 pb-4">
                                <DataTablePagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <VehicleDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                mode={dialogMode}
                vehicle={selectedVehicle}
                stores={stores}
                onSuccess={handleDialogSuccess}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the vehicle from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
