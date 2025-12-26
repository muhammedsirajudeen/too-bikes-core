"use client";

import AdminLayout from "@/components/AdminLayout";
import { Users, Package, Settings } from "lucide-react";

export default function AdminDashboard() {
    return (
        <AdminLayout pageTitle="Home" pageSubtitle="Workspace">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Overview of your TooBikes platform metrics and analytics.
                </p>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-[#1e1e3f] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">1,234</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">↑ 12% from last month</p>
                    </div>

                    <div className="bg-white dark:bg-[#1e1e3f] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                            <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">567</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">↑ 8% from last month</p>
                    </div>

                    <div className="bg-white dark:bg-[#1e1e3f] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Active Bikes</p>
                            <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">89</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">↑ 5% from last month</p>
                    </div>
                </div>

                {/* Additional sections matching the reference image */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#1e1e3f] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Revenue Breakdown</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-600 dark:text-gray-400">Platform Revenue</span>
                                <span className="font-semibold text-gray-900 dark:text-white">₹45,000</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-600 dark:text-gray-400">Vendor Payouts</span>
                                <span className="font-semibold text-gray-900 dark:text-white">₹32,000</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-600 dark:text-gray-400">Delivery Payouts</span>
                                <span className="font-semibold text-gray-900 dark:text-white">₹8,500</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1e1e3f] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Customer Overview</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-600 dark:text-gray-400">Total Customers</span>
                                <span className="font-semibold text-gray-900 dark:text-white">1,234</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-600 dark:text-gray-400">Active Customers</span>
                                <span className="font-semibold text-gray-900 dark:text-white">892</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-600 dark:text-gray-400">Inactive Customers</span>
                                <span className="font-semibold text-gray-900 dark:text-white">342</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-600 dark:text-gray-400">Repeat Customers</span>
                                <span className="font-semibold text-gray-900 dark:text-white">456</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
