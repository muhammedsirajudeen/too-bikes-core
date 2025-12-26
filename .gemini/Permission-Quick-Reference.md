# Permission System - Quick Reference

## For Backend Developers

### Protect an API Route

```typescript
import { requirePermission } from "@/middleware/permission.middleware";
import { Permission } from "@/constants/permissions.constant";

// Single permission required
export const GET = withLoggingAndErrorHandling(
    requirePermission(Permission.USER_VIEW, async (request, admin) => {
        // Your logic here
        // admin payload is automatically passed
        return NextResponse.json({ data });
    })
);
```

### Protect with Multiple Permissions (ANY)

```typescript
import { requireAnyPermission } from "@/middleware/permission.middleware";

export const POST = withLoggingAndErrorHandling(
    requireAnyPermission(
        [Permission.USER_CREATE, Permission.USER_UPDATE],
        async (request, admin) => {
            // User needs either USER_CREATE OR USER_UPDATE
            return NextResponse.json({ success: true });
        }
    )
);
```

### Add a New Permission

1. **Add to enum** (`constants/permissions.constant.ts`):
```typescript
export enum Permission {
    // ... existing permissions
    REPORTS_VIEW = 'reports.view',
    REPORTS_EXPORT = 'reports.export',
}
```

2. **Add to role mapping**:
```typescript
export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
    [AdminRole.ADMIN]: [
        // ... existing permissions
        Permission.REPORTS_VIEW,
        Permission.REPORTS_EXPORT,
    ],
    [AdminRole.STAFF]: [
        // ... existing permissions
        Permission.REPORTS_VIEW, // Staff can view but not export
    ],
};
```

3. **Use in API**:
```typescript
export const GET = requirePermission(Permission.REPORTS_VIEW, async (req, admin) => {
    // Logic
});
```

---

## For Frontend Developers

### Check Permission in Component

```typescript
import { useAdminAuth } from '@/contexts/admin-auth.context';

function MyComponent() {
    const { hasPermission } = useAdminAuth();

    if (!hasPermission(Permission.USER_VIEW)) {
        return <div>Access Denied</div>;
    }

    return <div>Content</div>;
}
```

### Conditional Rendering

```typescript
const { hasPermission } = useAdminAuth();

return (
    <div>
        {hasPermission(Permission.USER_DELETE) && (
            <Button onClick={handleDelete}>Delete</Button>
        )}
    </div>
);
```

### Use Permission Guard (Recommended)

```typescript
import { PermissionGuard } from '@/components/PermissionGuard';

// Guard entire page
<PermissionGuard 
    permission={Permission.USER_VIEW}
    redirectTo="/admin/dashboard"
>
    <UsersTable />
</PermissionGuard>

// Guard single element
<PermissionGuard permission={Permission.USER_DELETE}>
    <Button>Delete User</Button>
</PermissionGuard>

// With fallback
<PermissionGuard 
    permission={Permission.REPORTS_EXPORT}
    fallback={<p>You can't export reports</p>}
>
    <ExportButton />
</PermissionGuard>
```

### Check Multiple Permissions

```typescript
const { hasAnyPermission, hasAllPermissions } = useAdminAuth();

// User needs ANY of these permissions
if (hasAnyPermission([Permission.USER_CREATE, Permission.USER_UPDATE])) {
    // Show form
}

// User needs ALL of these permissions
if (hasAllPermissions([Permission.REPORTS_VIEW, Permission.REPORTS_EXPORT])) {
    // Show export button
}
```

### Add Permission to Sidebar Item

```typescript
// In AdminLayout.tsx
const allNavigationItems = [
    // ... existing items
    { 
        name: 'Reports', 
        icon: FileText, 
        href: '/admin/reports',
        permission: Permission.REPORTS_VIEW // Add this
    },
];
```

---

## Testing

### Test as Admin

```bash
# Login as admin
Username: admin
Password: admin123

# Should have access to:
✅ All sidebar items
✅ All pages
✅ All actions (delete, block, etc.)
```

### Test as Staff

```bash
# Login as staff
Username: staff
Password: staff123

# Should have access to:
✅ Dashboard, Orders, Stores, Vehicles
❌ Users page (hidden from sidebar)
❌ Delete actions
❌ User blocking
```

### Test API Directly

```bash
# Get staff token by logging in
STAFF_TOKEN="..."

# Should return 403 Forbidden
curl -H "Authorization: Bearer $STAFF_TOKEN" \
  http://localhost:3000/api/v1/admin/users

# Expected response:
# { "success": false, "message": "Insufficient permissions. Required: user.view" }
```

---

## Common Patterns

### Pattern 1: View + Edit Permissions

```typescript
// API: View users
export const GET = requirePermission(Permission.USER_VIEW, async (req) => {
    // All admins and staff can view
});

// API: Update users
export const PATCH = requirePermission(Permission.USER_UPDATE, async (req) => {
    // Only admins can update
});

// Frontend: Show edit button only if allowed
<PermissionGuard permission={Permission.USER_UPDATE}>
    <Button>Edit</Button>
</PermissionGuard>
```

### Pattern 2: Admin-Only Actions

```typescript
// Only admins have this permission
<PermissionGuard permission={Permission.USER_DELETE}>
    <Button variant="destructive">Delete</Button>
</PermissionGuard>
```

### Pattern 3: Different UI for Different Roles

```typescript
const { admin, hasPermission } = useAdminAuth();

return (
    <div>
        <h1>Welcome, {admin?.role === 'admin' ? 'Admin' : 'Staff'}</h1>
        
        {hasPermission(Permission.USER_VIEW) ? (
            <UsersTable />
        ) : (
            <p>Limited access - contact administrator</p>
        )}
    </div>
);
```

---

## Debugging

### Check User's Permissions

```typescript
const { permissions, admin } = useAdminAuth();

console.log('Current role:', admin?.role);
console.log('All permissions:', permissions);
```

### Check Stored Data

```javascript
// In browser console
JSON.parse(localStorage.getItem('admin_user'))

// Should show:
// {
//   id: "...",
//   username: "staff",
//   role: "staff",
//   permissions: ["order.view", "order.update", ...]
// }
```

### API Returns 403

1. Check if permission is in user's permission list
2. Check if API route has `requirePermission()` wrapper
3. Check if token is being sent in Authorization header
4. Check if permission exists in `Permission` enum

---

## Best Practices

### ✅ DO

- Always protect API routes with `requirePermission()`
- Use `<PermissionGuard>` for conditional UI rendering
- Check permissions, not roles
- Return meaningful error messages (403 with details)
- Test both as admin and staff

### ❌ DON'T

- Don't hardcode role checks (`if (role === 'admin')`)
- Don't rely only on frontend guards (always enforce backend)
- Don't expose sensitive data before checking permissions
- Don't assume every endpoint needs admin-only access
- Don't forget to add new permissions to role mapping

---

## Quick Checklist for New Feature

- [ ] Define permission in `Permission` enum
- [ ] Add to appropriate roles in `ROLE_PERMISSIONS`
- [ ] Protect API route with `requirePermission()`
- [ ] Add to sidebar if needed (with permission)
- [ ] Wrap page content with `<PermissionGuard>`
- [ ] Test as both admin and staff
- [ ] Verify 403 response for unauthorized access
- [ ] Document the permission in team docs

---

## Get Current User's Info

```typescript
import { useAdminAuth } from '@/contexts/admin-auth.context';

const { admin, permissions, hasPermission } = useAdminAuth();

// admin.id - User ID
// admin.username - Username
// admin.role - "admin" or "staff"
// permissions - Array of permission strings
// hasPermission(perm) - Check if has permission
```

---

## Need Help?

1. Read [RBAC-Implementation-Guide.md](./.gemini/RBAC-Implementation-Guide.md) for detailed explanation
2. Check existing implementations in `/app/api/v1/admin/users/route.ts`
3. Look at example page in `/app/admin/users/page.tsx`
4. Ask team lead about permission strategy for complex features
