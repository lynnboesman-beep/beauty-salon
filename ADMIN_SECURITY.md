# Admin Security Implementation

## 🔒 Security Overview

The salon booking app now has **proper role-based access control** for admin functionality. The security is enforced at multiple levels to prevent unauthorized access.

## 🏗️ Architecture

### 1. Database Schema
```
staff table:
- id (UUID) - matches Supabase Auth user ID
- full_name (string)
- role (string) - must be 'admin' for admin access
```

### 2. Custom Hooks (`/src/hooks/useAdminCheck.ts`)

#### `useAdminCheck()`
- Checks if current user is authenticated
- Verifies user exists in `staff` table
- Confirms `role = 'admin'`
- Returns: `{ isAdmin, isLoading, user, error }`

#### `useAdminProtection()`
- Same as `useAdminCheck` but automatically redirects non-admins
- Redirects to: `/login?message=admin_required&redirect=/admin/current-page`

## 🛡️ Security Layers

### Layer 1: Layout Protection
**File:** `/src/app/admin/layout.tsx`
- Uses `useAdminProtection()` hook
- **Blocks ALL admin pages** if user is not admin
- Shows proper error messages:
  - "Not authenticated" → Redirect to login
  - "User is not a staff member" → Access denied
  - "User does not have admin privileges" → Access denied

### Layer 2: UI Protection
**File:** `/src/components/Header.tsx`
- Uses `useAdminCheck()` hook
- Shows/hides navigation based on role:
  - **Admins see:** "Admin Dashboard" link
  - **Regular users see:** "Book Now", "My Bookings"

### Layer 3: Login Flow
**File:** `/src/app/login/page.tsx`
- Handles `?message=admin_required` parameter
- Shows clear message: "Admin privileges required"
- Redirects back to intended admin page after login

## 🔧 How to Make Someone Admin

### Method 1: Direct Database Insert
```sql
INSERT INTO staff (id, full_name, role) 
VALUES ('user-supabase-uuid-here', 'Admin Name', 'admin');
```

### Method 2: Through App (if you have existing admin access)
1. Go to `/admin/staff`
2. Add new staff member
3. Set role to `admin`

## 🚨 Security Features

### ✅ What's Protected
- **All admin pages** (`/admin/*`)
- **Admin navigation** (only shown to admins)
- **Direct URL access** (typing `/admin` won't work for non-admins)
- **API calls** (server-side validation in place)

### ✅ Error Handling
- **Not logged in** → Redirect to login
- **Logged in but not staff** → Access denied message
- **Staff but not admin** → Access denied message
- **Clear error messages** for each scenario

### ✅ User Experience
- **Loading states** during verification
- **Proper redirects** after login
- **Error messages** explain what's needed
- **Consistent styling** across all states

## 🔍 Testing Security

### Test Cases
1. **Anonymous user** → Should redirect to login
2. **Regular logged-in user** → Should show access denied
3. **Staff (non-admin)** → Should show access denied  
4. **Admin user** → Should show admin interface

### Test URLs
- `/admin` - Main dashboard
- `/admin/categories` - Category management
- `/admin/services` - Service management  
- `/admin/staff` - Staff management

## 🐛 Previous Security Issue (FIXED)

**Before:** Admin layout only checked authentication, not role
```typescript
// OLD (INSECURE)
if (!session) {
  router.push('/login');
} else {
  setIsAuthenticated(true); // ❌ ANY user could access admin
}
```

**After:** Admin layout checks role properly
```typescript
// NEW (SECURE)
const { isAdmin, isLoading, user, error } = useAdminProtection();
if (!isAdmin) {
  // Show proper error message and redirect
}
```

## 🚀 Implementation Status

- ✅ **Admin role checking** - Fully implemented
- ✅ **Layout protection** - All admin pages protected
- ✅ **UI consistency** - Header shows correct navigation
- ✅ **Error handling** - Clear messages for all scenarios
- ✅ **Redirect flow** - Proper login/redirect cycle
- ✅ **Loading states** - Good UX during checks

## 📝 Usage Examples

### In a component that needs admin check:
```typescript
import { useAdminCheck } from '@/hooks/useAdminCheck';

function MyComponent() {
  const { isAdmin, isLoading, user, error } = useAdminCheck();
  
  if (isLoading) return <div>Checking permissions...</div>;
  if (!isAdmin) return <div>Access denied</div>;
  
  return <div>Admin content here</div>;
}
```

### For a page that requires admin:
```typescript
import { useAdminProtection } from '@/hooks/useAdminCheck';

function AdminPage() {
  const { isAdmin, isLoading } = useAdminProtection();
  
  if (isLoading) return <div>Loading...</div>;
  // Will auto-redirect if not admin
  
  return <div>Admin page content</div>;
}
```

## 🔐 Security Best Practices Followed

1. **Server-side validation** - Role checked on backend
2. **Client-side protection** - UI hidden/shown based on role
3. **Proper error handling** - Clear messages, no info disclosure
4. **Redirect protection** - Can't bypass by typing URLs
5. **Session management** - Proper auth state handling
6. **Database constraints** - Role stored securely in database