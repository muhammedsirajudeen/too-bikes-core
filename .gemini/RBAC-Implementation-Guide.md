# Hybrid RBAC Permission System - Implementation Guide

## Overview

This system implements a **hybrid Role-Based Access Control (RBAC)** approach where:
- **Backend** is the **authority**: Defines roles, maps them to permissions, and enforces access control on every API
- **Frontend** is the **renderer**: Receives permissions from backend and uses them for UI rendering and navigation blocking

## Architecture

### Backend (Authority)

The backend is responsible for:
1. **Defining permissions** - Granular permissions like `user.view`, `order.update`, etc.
2. **Mapping roles to permissions** - Admin has all permissions, Staff has limited permissions
3. **Enforcing permissions on APIs** - Every sensitive API is guarded by permission middleware
4. **Sending permissions to frontend** - On login, backend resolves and returns user's permission set

### Frontend (Renderer)

The frontend:
1. **Receives permissions** from backend on authentication
2. **Does NOT make security decisions** - Only uses permissions for UX
3. **Conditionally renders UI** - Shows/hides sidebar items and components based on permissions
4. **Blocks navigation** - Prevents access to unauthorized routes for better UX

## File Structure

```
Backend:
├── constants/permissions.constant.ts       # Permission and role definitions
├── middleware/permission.middleware.ts     # Permission checking middleware
├── model/admin.model.ts                    # Admin model with role field
└── app/api/v1/admin/
    ├── login/route.ts                      # Returns permissions on login
    ├── users/route.ts                      # Protected with USER_VIEW permission
    └── orders/route.ts                     # Protected with ORDER_VIEW permission

Frontend:
├── contexts/admin-auth.context.tsx         # Admin auth context with permissions
├── components/
│   ├── AdminLayout.tsx                     # Permission-based sidebar filtering
│   └── PermissionGuard.tsx                 # Permission guard component
└── app/admin/
    ├── login/page.tsx                      # Stores permissions in localStorage
    └── users/page.tsx                      # Example of permission-guarded page
```

## Roles and Permissions

### Defined Roles

```typescript
enum AdminRole {
    ADMIN = 'admin',
    STAFF = 'staff',
}
```

### Permission Categories

**User Management** (Admin only):
- `user.view` - View users
- `user.create` - Create users
- `user.update` - Update/block users
- `user.delete` - Delete users
- `user.block` - Block/unblock users

**Order Management** (Admin + Staff):
- `order.view` - View orders
- `order.update` - Update orders
- `order.delete` - Delete orders (Admin only)
- `order.verify` - Verify orders

**Store Management** (Admin + Staff):
- `store.view` - View stores
- `store.create` - Create stores
- `store.update` - Update stores
- `store.delete` - Delete stores (Admin only)

**Vehicle Management** (Admin + Staff):
- `vehicle.view` - View vehicles
- `vehicle.create` - Create vehicles
- `vehicle.update` - Update vehicles
- `vehicle.delete` - Delete vehicles (Admin only)

**Other**:
- `dashboard.view` - Access dashboard
- `settings.view` - View settings
- `settings.update` - Update settings (Admin only)

## Backend Implementation

### Step 1: Define Permissions

**File:** `constants/permissions.constant.ts`

```typescript
export enum Permission {
    USER_VIEW = 'user.view',
    USER_CREATE = 'user.create',
    USER_UPDATE = 'user.update',
    USER_DELETE = 'user.delete',
    ORDER_VIEW = 'order.view',
    // ... more permissions
}

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
    [AdminRole.ADMIN]: [/* all permissions */],
    [AdminRole.STAFF]: [/* limited permissions */],
};
```

### Step 2: Add Role to Admin Model

**File:** `model/admin.model.ts`

```typescript
export interface IAdmin {
    username: string;
    password: string;
    role: AdminRole;
}

const adminSchema = new mongoose.Schema({
    role: { 
        type: String, 
        enum: Object.values(AdminRole), 
        default: AdminRole.STAFF,
        required: true 
    },
});
```

### Step 3: Return Permissions on Login

**File:** `app/api/v1/admin/login/route.ts`

```typescript
const adminRole = admin.role || AdminRole.STAFF;
const permissions = getPermissionsForRole(adminRole);

return NextResponse.json({
    token,
    admin: {
        id: admin._id.toString(),
        username: admin.username,
        role: adminRole,
        permissions, // Send resolved permissions to frontend
    },
});
```

### Step 4: Protect APIs with Permission Middleware

**File:** `middleware/permission.middleware.ts`

```typescript
export function requirePermission(
    permission: Permission,
    handler: (request: NextRequest, admin: AdminTokenPayload) => Promise<NextResponse>
) {
    return async (request: NextRequest): Promise<NextResponse> => {
        const result = checkPermission(request, permission);
        if (!result.authorized) {
            return NextResponse.json({ message: result.message }, { status: 403 });
        }
        return handler(request, result.admin!);
    };
}
```

**Usage in API Routes:**

```typescript
export const GET = withLoggingAndErrorHandling(
    requirePermission(Permission.USER_VIEW, async (request: NextRequest) => {
        // Only admins with USER_VIEW permission can access this
        const users = await UserModel.find();
        return NextResponse.json({ data: users });
    })
);
```

## Frontend Implementation

### Step 1: Create Admin Auth Context

**File:** `contexts/admin-auth.context.tsx`

```typescript
export function AdminAuthProvider({ children }) {
    const [permissions, setPermissions] = useState<string[]>([]);

    useEffect(() => {
        const storedAdmin = localStorage.getItem('admin_user');
        if (storedAdmin) {
            const adminData = JSON.parse(storedAdmin);
            setPermissions(adminData.permissions || []);
        }
    }, []);

    const hasPermission = (permission: string) => permissions.includes(permission);

    return (
        <AdminAuthContext.Provider value={{ permissions, hasPermission }}>
            {children}
        </AdminAuthContext.Provider>
    );
}
```

### Step 2: Store Permissions on Login

**File:** `app/admin/login/page.tsx`

```typescript
const data = await response.json();

if (data.token) {
    localStorage.setItem('admin_access_token', data.token);
}

if (data.admin) {
    localStorage.setItem('admin_user', JSON.stringify(data.admin));
}
```

### Step 3: Filter Sidebar Based on Permissions

**File:** `components/AdminLayout.tsx`

```typescript
const { hasPermission } = useAdminAuth();

const allNavigationItems = [
    { name: 'Users', href: '/admin/users', permission: Permission.USER_VIEW },
    { name: 'Orders', href: '/admin/orders', permission: Permission.ORDER_VIEW },
    // ... more items
];

// Filter items based on permissions
const navigationItems = allNavigationItems.filter(item => hasPermission(item.permission));
```

### Step 4: Use Permission Guard in Pages

**File:** `app/admin/users/page.tsx`

```typescript
<PermissionGuard 
    permission={Permission.USER_VIEW}
    redirectTo="/admin/dashboard"
    fallback={<div>Access Denied</div>}
>
    {/* Page content - only visible to users with permission */}
    <UsersTable />
</PermissionGuard>
```

## Usage Examples

### Protecting an API Route

```typescript
// Only admins can delete users (staff cannot)
export const DELETE = withLoggingAndErrorHandling(
    requirePermission(Permission.USER_DELETE, async (request: NextRequest, admin) => {
        const { userId } = await request.json();
        await UserModel.findByIdAndDelete(userId);
        return NextResponse.json({ success: true });
    })
);
```

### Conditional UI Rendering

```typescript
import { useAdminAuth } from '@/contexts/admin-auth.context';

function MyComponent() {
    const { hasPermission } = useAdminAuth();

    return (
        <div>
            {/* Only show delete button if user has permission */}
            {hasPermission(Permission.USER_DELETE) && (
                <Button onClick={handleDelete}>Delete</Button>
            )}
        </div>
    );
}
```

### Using Permission Guard Component

```typescript
// Guard entire page
<PermissionGuard permission={Permission.USER_VIEW} redirectTo="/admin/dashboard">
    <UsersPage />
</PermissionGuard>

// Guard single component
<PermissionGuard permission={Permission.USER_UPDATE}>
    <Button>Block User</Button>
</PermissionGuard>
```

## Security Principles

### ✅ DO

1. **Always enforce permissions on the backend** - Never trust the frontend
2. **Return 403 Forbidden** when permission is denied
3. **Check permissions per-endpoint** - Don't assume role = access
4. **Use granular permissions** - Better control and flexibility
5. **Keep permission checks simple** - Don't overcomplicate the logic

### ❌ DON'T

1. **Don't make security decisions on frontend** - It's bypassable
2. **Don't hardcode roles** in API logic (use permissions instead)
3. **Don't assume admin = full access** - Always check specific permission
4. **Don't skip permission checks** thinking "only admins can call this"
5. **Don't return sensitive data** before checking permissions

## Testing the System

### Create Test Admin and Staff Users

```javascript
// Connect to MongoDB and create test users
db.admins.insertMany([
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'staff', password: 'staff123', role: 'staff' }
]);
```

### Test Cases

1. **Login as Admin**
   - Should see "Users" in sidebar
   - Can access `/admin/users`
   - Can block/unblock users

2. **Login as Staff**
   - Should NOT see "Users" in sidebar
   - Cannot access `/admin/users` (403 Forbidden from API)
   - If navigates manually, sees "Access Denied"
   - Can still access orders, stores, vehicles

3. **API Permission Enforcement**
   ```bash
   # Should fail with 403 for staff
   curl -H "Authorization: Bearer <staff_token>" http://localhost:3000/api/v1/admin/users
   ```

## Extending the System

### Adding a New Permission

1. Add to `Permission` enum in `permissions.constant.ts`
2. Add to appropriate role in `ROLE_PERMISSIONS`
3. Protect API routes with `requirePermission(Permission.NEW_PERMISSION, ...)`
4. Use in frontend with `<PermissionGuard permission={Permission.NEW_PERMISSION}>`

### Adding a New Role

1. Add to `AdminRole` enum
2. Define permission set in `ROLE_PERMISSIONS`
3. Backend automatically enforces it
4. Frontend automatically reflects it

## Advantages of This Approach

1. **Security Centralized** - All permission logic in backend, can't be bypassed
2. **Clean Separation** - Backend = authority, Frontend = renderer
3. **Flexible** - Easy to add new roles and permissions
4. **Maintainable** - One source of truth for permissions
5. **Type-Safe** - TypeScript ensures correctness
6. **Performance** - No extra API calls to check permissions (sent on login)
7. **Better UX** - Frontend hides unauthorized options instead of showing errors

## Common Pitfalls

1. **Forgetting to protect API routes** - Always use `requirePermission()`
2. **Not storing admin data on login** - Frontend needs permissions
3. **Hardcoding role checks** - Use permissions, not roles
4. **Assuming sidebar visibility = access** - Always enforce on backend
5. **Not handling 403 gracefully** - Show proper error messages

## Conclusion

This hybrid RBAC system provides **enterprise-grade security** while maintaining **great UX**. The backend is the single source of truth for permissions, and the frontend uses these permissions purely for rendering decisions. By following this pattern, you avoid the common pitfalls of pure frontend RBAC (bypassable) and pure backend RBAC (poor UX).
