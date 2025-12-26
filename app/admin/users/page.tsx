"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { PermissionGuard } from "@/components/PermissionGuard";
import { Permission } from "@/constants/permissions.constant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface User {
    _id: string;
    name?: string;
    email?: string;
    phoneNumber: string;
    role: string;
    isBlocked: boolean;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('admin_access_token');
            if (!token) return;

            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(searchQuery && { search: searchQuery }),
            });

            const response = await fetch(`/api/v1/admin/users?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.data || []);
                setTotalPages(data.pagination?.totalPages || 1);
            } else if (response.status === 403) {
                // Permission denied - will be handled by PermissionGuard
                console.error('Permission denied');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage, searchQuery]);

    const handleBlockUser = async (userId: string, isBlocked: boolean) => {
        try {
            const token = localStorage.getItem('admin_access_token');
            if (!token) return;

            const response = await fetch('/api/v1/admin/users', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, isBlocked: !isBlocked }),
            });

            if (response.ok) {
                // Refresh users list
                fetchUsers();
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    return (
        <AdminLayout pageTitle="User Management" pageSubtitle="Manage system users">
            {/* Permission Guard - Only users with USER_VIEW permission can see this */}
            <PermissionGuard 
                permission={Permission.USER_VIEW}
                redirectTo="/admin/dashboard"
                fallback={
                    <div className="text-center py-12">
                        <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            You don't have permission to view users.
                        </p>
                    </div>
                }
            >
                <div className="space-y-6">
                    {/* Search Bar */}
                    <div className="flex gap-4">
                        <Input
                            placeholder="Search by name, email, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-md"
                        />
                    </div>

                    {/* Users Table */}
                    <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-[#0f0f23]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-[#1a1a2e] divide-y divide-gray-200 dark:divide-gray-700">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {user.name || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {user.email || user.phoneNumber}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    user.isBlocked 
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
                                                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                }`}>
                                                    {user.isBlocked ? 'Blocked' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {/* Only show block/unblock button if user has USER_UPDATE permission */}
                                                <PermissionGuard permission={Permission.USER_UPDATE}>
                                                    <Button
                                                        size="sm"
                                                        variant={user.isBlocked ? "default" : "destructive"}
                                                        onClick={() => handleBlockUser(user._id, user.isBlocked)}
                                                    >
                                                        {user.isBlocked ? 'Unblock' : 'Block'}
                                                    </Button>
                                                </PermissionGuard>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2">
                            <Button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="px-4 py-2 text-sm">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            </PermissionGuard>
        </AdminLayout>
    );
}
