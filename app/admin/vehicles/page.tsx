"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { useDebounce } from "@/hooks/useDebounce";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Home, Users, Settings, LogOut, Package, User, Moon, Sun, Store, Plus, Pencil, Trash2, Car, Search, Filter } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
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

export default function VehiclesPage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [adminUsername, setAdminUsername] = useState<string>("");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [stores, setStores] = useState<StoreOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

    // Filter/Search State
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500); // Debounce search
    const [filterStore, setFilterStore] = useState<string>("all");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalVehicles, setTotalVehicles] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        setMounted(true);


        const token = localStorage.getItem('admin_access_token');
        if (!token) {
            router.push('/');
            return;
        }

        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            const payload = JSON.parse(jsonPayload);
            setAdminUsername(payload.username || 'Admin');
        } catch (error) {
            console.error('Failed to decode token:', error);
            router.push('/');
        }

        fetchData();
    }, [router]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, filterStore]);

    // Fetch data when page OR filters change
    useEffect(() => {
        if (mounted) {
            fetchData();
        }
    }, [currentPage, debouncedSearchQuery, filterStore, mounted]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_access_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [vehiclesRes, storesRes] = await Promise.all([
                fetch(`/api/v1/admin/vehicles?page=${currentPage}&limit=${itemsPerPage}`, { headers }),
                fetch('/api/v1/stores') // Stores generic API
            ]);

            const vehiclesData = await vehiclesRes.json();
            const storesData = await storesRes.json();

            if (vehiclesData.success) {
                setVehicles(vehiclesData.data);
                if (vehiclesData.pagination) {
                    setTotalPages(vehiclesData.pagination.totalPages);
                    setTotalVehicles(vehiclesData.pagination.total);
                }
            }
            if (storesData.success) {
                setStores(storesData.data);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/v1/admin/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout API error:', error);
        }
        localStorage.removeItem('admin_access_token');
        router.push('/');
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
                fetchData();
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
        fetchData();
        toast.success(dialogMode === "create" ? "Vehicle added successfully" : "Vehicle updated successfully");
    };

    if (!mounted) return null;

    const navigationItems = [
        { name: 'Dashboard', icon: Home, href: '/admin/dashboard' },
        { name: 'Users', icon: Users, href: '/admin/users' },
        { name: 'Orders', icon: Package, href: '/admin/orders' },
        { name: 'Store Management', icon: Store, href: '/admin/stores' },
        { name: 'Vehicle Management', icon: Car, href: '/admin/vehicles' },
        { name: 'Settings', icon: Settings, href: '/admin/settings' },
    ];

    const initials = adminUsername
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'AU';

    // Filter Logic
    const filteredVehicles = vehicles.filter((vehicle) => {
        // ... (existing filter implementation)
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            vehicle.name.toLowerCase().includes(query) ||
            vehicle.brand.toLowerCase().includes(query) ||
            vehicle.licensePlate.toLowerCase().includes(query);

        let matchesStore = true;
        if (filterStore !== "all") {
            const vehicleStoreId = typeof vehicle.store === 'object' ? vehicle.store._id : vehicle.store;
            matchesStore = vehicleStoreId === filterStore;
        }

        return matchesSearch && matchesStore;
    });

    // Backend now handles pagination, use vehicles directly
    const paginatedVehicles = filteredVehicles;


    // ...



    return (
        <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <div className="flex min-h-screen w-full">
                <Sidebar collapsible="icon">
                    <SidebarHeader className="border-b border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            <span className="font-bold group-data-[collapsible=icon]:hidden">Admin Panel</span>
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {navigationItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = item.href === '/admin/vehicles';
                                        return (
                                            <SidebarMenuItem key={item.name}>
                                                <SidebarMenuButton
                                                    onClick={() => router.push(item.href)}
                                                    tooltip={item.name}
                                                    isActive={isActive}
                                                >
                                                    <Icon />
                                                    <span>{item.name}</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter className="border-t border-gray-200 dark:border-gray-700 p-2">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg bg-blue-600 text-white">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{adminUsername}</span>
                                        <span className="truncate text-xs text-gray-500 dark:text-gray-400">Admin User</span>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                                    <LogOut />
                                    <span>Logout</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>

                <main className="flex-1 overflow-auto bg-gray-50 dark:bg-[#0f0f23]">
                    <div className="sticky top-0 z-10 bg-white dark:bg-[#1a1a2e] border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
                        <SidebarTrigger />
                        <div className="flex items-center justify-between flex-1">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Workspace</p>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Vehicle Management</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleAddVehicle}
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Vehicle
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                    className="h-9 w-9"
                                >
                                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                    <span className="sr-only">Toggle theme</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Vehicles</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Manage your fleet of rental vehicles.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                    {/* Search Input */}
                                    <div className="relative w-full sm:w-[250px]">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                        <Input
                                            placeholder="Search by name, brand, plate..."
                                            className="pl-9"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    {/* Store Filter */}
                                    <div className="w-full sm:w-[200px]">
                                        <Select value={filterStore} onValueChange={setFilterStore}>
                                            <SelectTrigger>
                                                <div className="flex items-center gap-2">
                                                    <Filter className="h-4 w-4 text-gray-500" />
                                                    <SelectValue placeholder="Filter by Store" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Stores</SelectItem>
                                                {stores.map(store => (
                                                    <SelectItem key={store._id} value={store._id}>{store.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>


                            {loading ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 dark:text-gray-400">Loading vehicles...</p>
                                </div>
                            ) : filteredVehicles.length === 0 ? (
                                <div className="bg-white dark:bg-[#1e1e3f] rounded-xl p-12 border border-gray-200 dark:border-gray-800 text-center">
                                    <Car className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                                        {vehicles.length === 0 ? "No vehicles yet" : "No vehicles found"}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        {vehicles.length === 0 ? "Add your first vehicle to the fleet." : "Try adjusting your search or filter."}
                                    </p>
                                    {vehicles.length === 0 && (
                                        <Button onClick={handleAddVehicle}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Vehicle
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-[#1e1e3f] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 dark:bg-[#0f0f23] border-b border-gray-200 dark:border-gray-800">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Image
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Vehicle Info
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Plate
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Store
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Price/Hr
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
                                                {paginatedVehicles.map((vehicle) => {
                                                    // Resolve store name if populated or just ID
                                                    const storeName = typeof vehicle.store === 'object' ? vehicle.store.name : stores.find(s => s._id === vehicle.store)?.name || "Unknown Store";

                                                    return (
                                                        <tr key={vehicle._id} className="hover:bg-gray-50 dark:hover:bg-[#0f0f23]">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="relative h-10 w-16 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                                                                    {vehicle.image && vehicle.image.length > 0 && vehicle.image[0].url ? (
                                                                        <Image
                                                                            src={vehicle.image[0].url}
                                                                            alt={vehicle.name}
                                                                            fill
                                                                            className="object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                                            <Car className="h-5 w-5" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {vehicle.brand} {vehicle.name}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                                        {vehicle.fuelType} • {vehicle.modelYear || "N/A"}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900 dark:text-white">
                                                                    {vehicle.licensePlate}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900 dark:text-white">
                                                                    {storeName}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900 dark:text-white">
                                                                    ₹{vehicle.pricePerHour}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vehicle.isActive
                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                                                                    : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200"
                                                                    }`}>
                                                                    {vehicle.isActive ? "Active" : "Inactive"}
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
                                                    )
                                                })}
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
                    </div>
                </main>
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
        </SidebarProvider>
    );
}
