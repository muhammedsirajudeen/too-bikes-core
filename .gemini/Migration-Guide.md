# Migration Guide: Adding Permissions to Existing Admin APIs

This guide shows how to update your existing admin API routes to use the new permission system.

---

## Quick Migration Checklist

For each admin API route:
- [ ] Import permission middleware and constants
- [ ] Replace old auth check with `requirePermission()`
- [ ] Choose appropriate permission from enum
- [ ] Test with both admin and staff users
- [ ] Verify 403 response for unauthorized access

---

## Pattern 1: Simple GET Endpoint

### Before (Old Way)

```typescript
import { verifyAdminAuthFromRequest } from "@/utils/admin-auth.utils";

export const GET = withLoggingAndErrorHandling(async (request: NextRequest) => {
    // Old role-based check
    const authCheck = verifyAdminAuthFromRequest(request);
    if (!authCheck.valid) {
        return NextResponse.json(
            { success: false, message: authCheck.message },
            { status: HttpStatus.UNAUTHORIZED }
        );
    }

    // Your logic here
    const data = await fetchSomeData();
    return NextResponse.json({ data });
});
```

### After (New Way)

```typescript
import { requirePermission } from "@/middleware/permission.middleware";
import { Permission } from "@/constants/permissions.constant";

export const GET = withLoggingAndErrorHandling(
    requirePermission(Permission.ORDER_VIEW, async (request: NextRequest, admin) => {
        // Your logic here (unchanged)
        const data = await fetchSomeData();
        return NextResponse.json({ data });
    })
);
```

**Changes:**
1. Import `requirePermission` instead of `verifyAdminAuthFromRequest`
2. Import `Permission` enum
3. Wrap handler with `requirePermission()`
4. Remove manual auth check
5. Handler now receives `admin` as second parameter

---

## Pattern 2: POST/PATCH/DELETE Endpoint

### Before

```typescript
export const DELETE = withLoggingAndErrorHandling(async (request: NextRequest) => {
    const authCheck = verifyAdminAuthFromRequest(request);
    if (!authCheck.valid) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    await deleteItem(id);
    return NextResponse.json({ success: true });
});
```

### After

```typescript
export const DELETE = withLoggingAndErrorHandling(
    requirePermission(Permission.STORE_DELETE, async (request: NextRequest, admin) => {
        const { id } = await request.json();
        
        // Optional: Log who performed the action
        console.log(`${admin.username} (${admin.role}) deleted item ${id}`);
        
        await deleteItem(id);
        return NextResponse.json({ success: true });
    })
);
```

**Benefits:**
- More granular control (delete permission vs just "is admin")
- Automatic 403 response with helpful error message
- Access to admin info for audit logging

---

## Pattern 3: Multiple Permissions (Any)

For endpoints where users need ANY of several permissions:

```typescript
import { requireAnyPermission } from "@/middleware/permission.middleware";

export const POST = withLoggingAndErrorHandling(
    requireAnyPermission(
        [Permission.VEHICLE_CREATE, Permission.VEHICLE_UPDATE],
        async (request: NextRequest, admin) => {
            // User can create OR update
            const data = await request.json();
            return NextResponse.json({ success: true });
        }
    )
);
```

---

## Choosing the Right Permission

### Decision Tree

```
Is this a read operation (GET)?
├─ Yes → Use *_VIEW permission
│   ├─ Users → USER_VIEW
│   ├─ Orders → ORDER_VIEW
│   ├─ Stores → STORE_VIEW
│   └─ Vehicles → VEHICLE_VIEW
│
└─ No → Is it create/update/delete?
    ├─ Create → Use *_CREATE permission
    ├─ Update → Use *_UPDATE permission
    └─ Delete → Use *_DELETE permission

Special cases:
- Order verification → ORDER_VERIFY
- User blocking → USER_BLOCK
- Settings → SETTINGS_UPDATE
```

---

## Updating Existing Routes

### File: `/app/api/v1/admin/stores/route.ts`

**Before:**
```typescript
export const GET = async (request: NextRequest) => {
    const authCheck = verifyAdminAuthFromRequest(request);
    if (!authCheck.valid) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const stores = await StoreModel.find();
    return NextResponse.json({ data: stores });
};
```

**After:**
```typescript
export const GET = withLoggingAndErrorHandling(
    requirePermission(Permission.STORE_VIEW, async (request: NextRequest) => {
        const stores = await StoreModel.find();
        return NextResponse.json({ data: stores });
    })
);
```

### File: `/app/api/v1/admin/vehicles/[id]/route.ts`

**Before:**
```typescript
export const PATCH = async (request: NextRequest) => {
    const authCheck = verifyAdminAuthFromRequest(request);
    if (!authCheck.valid) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    // Update logic
};
```

**After:**
```typescript
export const PATCH = withLoggingAndErrorHandling(
    requirePermission(Permission.VEHICLE_UPDATE, async (request: NextRequest) => {
        // Update logic (unchanged)
    })
);
```

### File: `/app/api/v1/admin/stores/[id]/route.ts`

**Delete should be admin-only:**

```typescript
export const DELETE = withLoggingAndErrorHandling(
    requirePermission(Permission.STORE_DELETE, async (request: NextRequest) => {
        // Delete logic
    })
);
```

---

## Complete Example: Stores API

Here's a complete example showing all CRUD operations:

**File:** `/app/api/v1/admin/stores/route.ts`

```typescript
import { HttpStatus } from "@/constants/status.constant";
import { StoreModel } from "@/model/store.model";
import { withLoggingAndErrorHandling } from "@/utils/decorator.utilt";
import { requirePermission } from "@/middleware/permission.middleware";
import { Permission } from "@/constants/permissions.constant";
import { NextRequest, NextResponse } from "next/server";

// GET - View stores (Admin + Staff)
export const GET = withLoggingAndErrorHandling(
    requirePermission(Permission.STORE_VIEW, async (request: NextRequest) => {
        const stores = await StoreModel.find();
        return NextResponse.json({
            success: true,
            data: stores,
        }, { status: HttpStatus.OK });
    })
);

// POST - Create store (Admin + Staff)
export const POST = withLoggingAndErrorHandling(
    requirePermission(Permission.STORE_CREATE, async (request: NextRequest, admin) => {
        const body = await request.json();
        const store = await StoreModel.create(body);
        
        console.log(`Store created by ${admin.username}`);
        
        return NextResponse.json({
            success: true,
            data: store,
        }, { status: HttpStatus.CREATED });
    })
);
```

**File:** `/app/api/v1/admin/stores/[id]/route.ts`

```typescript
// PATCH - Update store (Admin + Staff)
export const PATCH = withLoggingAndErrorHandling(
    requirePermission(Permission.STORE_UPDATE, async (request: NextRequest) => {
        const { id } = context.params;
        const body = await request.json();
        const store = await StoreModel.findByIdAndUpdate(id, body, { new: true });
        
        return NextResponse.json({
            success: true,
            data: store,
        }, { status: HttpStatus.OK });
    })
);

// DELETE - Delete store (Admin only)
export const DELETE = withLoggingAndErrorHandling(
    requirePermission(Permission.STORE_DELETE, async (request: NextRequest, admin) => {
        const { id } = context.params;
        await StoreModel.findByIdAndDelete(id);
        
        console.log(`Store ${id} deleted by ${admin.username}`);
        
        return NextResponse.json({
            success: true,
            message: 'Store deleted successfully',
        }, { status: HttpStatus.OK });
    })
);
```

---

## Testing After Migration

### 1. Test with Admin Token

```bash
# Should succeed
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:3000/api/v1/admin/stores
```

### 2. Test with Staff Token

```bash
# Should succeed (staff can view)
curl -H "Authorization: Bearer STAFF_TOKEN" \
  http://localhost:3000/api/v1/admin/stores

# Should fail with 403 (staff cannot delete)
curl -X DELETE \
  -H "Authorization: Bearer STAFF_TOKEN" \
  http://localhost:3000/api/v1/admin/stores/123
```

### 3. Test without Token

```bash
# Should fail with 403
curl http://localhost:3000/api/v1/admin/stores
```

---

## Common Mistakes to Avoid

### ❌ Wrong: Checking role instead of permission

```typescript
export const GET = async (request: NextRequest) => {
    const token = getToken(request);
    if (token.role !== 'admin') {  // DON'T DO THIS
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }
    // ...
};
```

### ✅ Right: Checking permission

```typescript
export const GET = requirePermission(Permission.STORE_VIEW, async (request) => {
    // Permission automatically checked
    // ...
});
```

---

### ❌ Wrong: Manual permission check

```typescript
export const GET = async (request: NextRequest) => {
    const token = decodeToken(request);
    if (!token.permissions.includes('store.view')) {  // DON'T DO THIS
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }
    // ...
};
```

### ✅ Right: Using middleware

```typescript
export const GET = requirePermission(Permission.STORE_VIEW, async (request) => {
    // Middleware handles it
    // ...
});
```

---

## Migration Priority

### High Priority (Do First)
1. ✅ **Users API** - Prevents staff from managing users
2. ✅ **Settings API** - Prevents unauthorized changes
3. **Delete endpoints** - Restrict destructive operations

### Medium Priority
4. **Update/Patch endpoints** - Control modification access
5. **Create endpoints** - Manage resource creation

### Low Priority
6. **Read endpoints** - Usually okay for staff to view

---

## Automated Migration Script

If you have many routes, you can create a script to help:

```javascript
// scripts/migrate-to-permissions.js
const fs = require('fs');
const path = require('path');

// Find all route.ts files in admin API
// Replace verifyAdminAuthFromRequest with requirePermission
// (This is just a starting point - review manually!)
```

---

## Summary

**Per-file changes:**
1. Add imports for `requirePermission` and `Permission`
2. Wrap handler with `requirePermission()`
3. Choose appropriate permission
4. Remove old auth check
5. Test thoroughly

**Time estimate:** ~5 minutes per route file

**Risk:** Low (non-breaking if done correctly, fails closed)
