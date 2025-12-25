"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Home, Users, Settings, LogOut, Package, User, Moon, Sun, Store, Plus, Pencil, Trash2, Car, Search, Filter } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StoreDialog } from "@/components/StoreForm/StoreDialog";
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

interface Store {
    _id: string;
    name: string;
    description?: string;
    address: string;
    district: string;
    openingTime: string;
    closingTime: string;
    contactNumber?: string;
    latitude: number;
    longitude: number;
    images?: string[];
}

export default function StoresPage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [adminUsername, setAdminUsername] = useState<string>("");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
    const [selectedStore, setSelectedStore] = useState<Store | undefined>();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [storeToDelete, setStoreToDelete] = useState<string | null>(null);

    // Search/Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500); // Debounce search
    const [filterDistrict, setFilterDistrict] = useState<string>("all");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalStores, setTotalStores] = useState(0);
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

        fetchStores();
    }, [router]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, filterDistrict]);

    // Fetch stores when page OR filters change
    useEffect(() => {
        if (mounted) {
            fetchStores();
        }
    }, [currentPage, debouncedSearchQuery, filterDistrict, mounted]);

    const fetchStores = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_access_token');
            
            // Build query params
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
            });
            
            // Add filters if not "all"
            if (filterDistrict !== 'all') params.append('district', filterDistrict);
            if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
            
            const response = await fetch(`/api/v1/admin/stores?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setStores(data.data);
                if (data.pagination) {
                    setTotalPages(data.pagination.totalPages);
                    setTotalStores(data.pagination.total);
                }
            } else {
                toast.error("Failed to load stores");
            }
        } catch (error) {
            console.error('Failed to fetch stores:', error);
            toast.error("Failed to load stores");
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

    const handleAddStore = () => {
        setDialogMode("create");
        setSelectedStore(undefined);
        setDialogOpen(true);
    };

    const handleEditStore = (store: Store) => {
        setDialogMode("edit");
        setSelectedStore(store);
        setDialogOpen(true);
    };

    const handleDeleteClick = (storeId: string) => {
        setStoreToDelete(storeId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!storeToDelete) return;

        try {
            const token = localStorage.getItem('admin_access_token');
            const response = await fetch(`/api/v1/admin/stores/${storeToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                toast.success("Store deleted successfully");
                fetchStores();
            } else {
                toast.error(data.message || "Failed to delete store");
            }
        } catch (error) {
            console.error('Failed to delete store:', error);
            toast.error("Failed to delete store");
        } finally {
            setDeleteDialogOpen(false);
            setStoreToDelete(null);
        }
    };

    const handleDialogSuccess = () => {
        fetchStores();
        toast.success(dialogMode === "create" ? "Store added successfully" : "Store updated successfully");
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

    // Backend now handles pagination
    const paginatedStores = stores;


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
                                        const isActive = item.href === '/admin/stores';
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
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Store Management</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleAddStore}
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Store
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
                            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Stores</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Manage all store locations and their details.
                            </p>

                            {/* Search and Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search stores by name, address, or contact..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <select
                                    value={filterDistrict}
                                    onChange={(e) => setFilterDistrict(e.target.value)}
                                    className="px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-white w-full sm:w-[200px]"
                                >
                                    <option value="all">All Districts</option>
                                    <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                                    <option value="Kollam">Kollam</option>
                                    <option value="Pathanamthitta">Pathanamthitta</option>
                                    <option value="Alappuzha">Alappuzha</option>
                                    <option value="Kottayam">Kottayam</option>
                                    <option value="Idukki">Idukki</option>
                                    <option value="Ernakulam">Ernakulam</option>
                                    <option value="Thrissur">Thrissur</option>
                                    <option value="Palakkad">Palakkad</option>
                                    <option value="Malappuram">Malappuram</option>
                                    <option value="Kozhikode">Kozhikode</option>
                                    <option value="Wayanad">Wayanad</option>
                                    <option value="Kannur">Kannur</option>
                                    <option value="Kasaragod">Kasaragod</option>
                                </select>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 dark:text-gray-400">Loading stores...</p>
                                </div>
                            ) : stores.length === 0 ? (
                                <div className="bg-white dark:bg-[#1e1e3f] rounded-xl p-12 border border-gray-200 dark:border-gray-800 text-center">
                                    <Store className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No stores yet</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        Get started by adding your first store location.
                                    </p>
                                    <Button onClick={handleAddStore}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Your First Store
                                    </Button>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-[#1e1e3f] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 dark:bg-[#0f0f23] border-b border-gray-200 dark:border-gray-800">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Name
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Address
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        District
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Hours
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Contact
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                                {paginatedStores.map((store) => (
                                                    <tr key={store._id} className="hover:bg-gray-50 dark:hover:bg-[#0f0f23]">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {store.name}
                                                            </div>
                                                            {store.description && (
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {store.description}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {store.address}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {store.district}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {store.openingTime} - {store.closingTime}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {store.contactNumber || '-'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleEditStore(store)}
                                                                    className="h-8 w-8"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDeleteClick(store._id)}
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
                    </div>
                </main>
            </div>

            <StoreDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                mode={dialogMode}
                store={selectedStore}
                onSuccess={handleDialogSuccess}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the store from the database.
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
