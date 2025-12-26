/**
 * Permission Constants
 * Defines all available permissions in the system
 */

export enum Permission {
    // User Management
    USER_VIEW = 'user.view',
    USER_CREATE = 'user.create',
    USER_UPDATE = 'user.update',
    USER_DELETE = 'user.delete',
    USER_BLOCK = 'user.block',

    // Order Management
    ORDER_VIEW = 'order.view',
    ORDER_UPDATE = 'order.update',
    ORDER_DELETE = 'order.delete',
    ORDER_VERIFY = 'order.verify',

    // Store Management
    STORE_VIEW = 'store.view',
    STORE_CREATE = 'store.create',
    STORE_UPDATE = 'store.update',
    STORE_DELETE = 'store.delete',

    // Vehicle Management
    VEHICLE_VIEW = 'vehicle.view',
    VEHICLE_CREATE = 'vehicle.create',
    VEHICLE_UPDATE = 'vehicle.update',
    VEHICLE_DELETE = 'vehicle.delete',

    // Settings
    SETTINGS_VIEW = 'settings.view',
    SETTINGS_UPDATE = 'settings.update',

    // Dashboard
    DASHBOARD_VIEW = 'dashboard.view',
}

export enum AdminRole {
    ADMIN = 'admin',
    STAFF = 'staff',
}

/**
 * Role-to-Permission Mapping
 * Defines what permissions each role has
 */
export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
    [AdminRole.ADMIN]: [
        // Admins have ALL permissions
        Permission.USER_VIEW,
        Permission.USER_CREATE,
        Permission.USER_UPDATE,
        Permission.USER_DELETE,
        Permission.USER_BLOCK,
        Permission.ORDER_VIEW,
        Permission.ORDER_UPDATE,
        Permission.ORDER_DELETE,
        Permission.ORDER_VERIFY,
        Permission.STORE_VIEW,
        Permission.STORE_CREATE,
        Permission.STORE_UPDATE,
        Permission.STORE_DELETE,
        Permission.VEHICLE_VIEW,
        Permission.VEHICLE_CREATE,
        Permission.VEHICLE_UPDATE,
        Permission.VEHICLE_DELETE,
        Permission.SETTINGS_VIEW,
        Permission.SETTINGS_UPDATE,
        Permission.DASHBOARD_VIEW,
    ],
    [AdminRole.STAFF]: [
        // Staff CANNOT manage users, but can do everything else
        Permission.ORDER_VIEW,
        Permission.ORDER_UPDATE,
        Permission.ORDER_VERIFY,
        Permission.STORE_VIEW,
        Permission.STORE_CREATE,
        Permission.STORE_UPDATE,
        Permission.VEHICLE_VIEW,
        Permission.VEHICLE_CREATE,
        Permission.VEHICLE_UPDATE,
        Permission.SETTINGS_VIEW,
        Permission.DASHBOARD_VIEW,
    ],
};

/**
 * Get permissions for a given role
 */
export function getPermissionsForRole(role: AdminRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: AdminRole, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}
