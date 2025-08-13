# Admin Role Routing Debug - UPDATED FIX

## Current Issue
User with "Admin" role is being redirected to `/dashboard/employee` instead of `/dashboard/reporting`.

## Your Login Response Analysis
```json
{
  "User": {
    "Id": "d4e3a0ac-7eec-480e-be0f-89f7c4ad7121",
    "UserName": "admin",
    "Email": "admin@bpm.com",
    "Roles": ["Admin"]  // ← Backend uses "Roles" (capital R)
  }
}
```

## Root Cause Identified
**Property Name Mismatch:** Your backend returns `"Roles": ["Admin"]` (capital R) but the frontend UserDto model was expecting `"roles"` (lowercase r).

## Fix Applied

### 1. Updated UserDto Model
```typescript
export interface UserDto {
  id: string;
  userName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roles: string[];
  // Backend compatibility - your backend returns "Roles" with capital R
  Roles?: string[];
}
```

### 2. Updated Auth Service Methods
```typescript
hasRole(role: string): boolean {
  const user = this.getCurrentUser();
  const userRoles = user?.roles || user?.Roles || [];
  return userRoles.includes(role);
}

hasAnyRole(roles: string[]): boolean {
  const user = this.getCurrentUser();
  const userRoles = user?.roles || user?.Roles || [];
  if (userRoles.length === 0) return false;
  return roles.some(role => userRoles.includes(role));
}

getDashboardRoute(): string {
  const user = this.getCurrentUser();
  const userRoles = user?.roles || user?.Roles || [];
  
  // Debug logging (will show in browser console)
  console.log('User object:', user);
  console.log('User roles detected:', userRoles);
  
  if (userRoles.length === 0) {
    console.log('No roles found, defaulting to employee dashboard');
    return '/dashboard/employee';
  }

  // Priority order: Admin > HR > Manager > Employee
  if (userRoles.includes('Admin')) {
    console.log('Admin role detected, redirecting to reporting dashboard');
    return '/dashboard/reporting'; // ← Should redirect here for Admin
  }
  
  if (userRoles.includes('HR')) {
    console.log('HR role detected, redirecting to HR dashboard');
    return '/dashboard/hr';
  }
  
  if (userRoles.includes('Manager')) {
    console.log('Manager role detected, redirecting to manager dashboard');
    return '/dashboard/manager';
  }
  
  console.log('No specific role matched, defaulting to employee dashboard');
  return '/dashboard/employee';
}
```

## Expected Behavior Now
With your Admin role, the system should:

1. **Login** → Detect `"Roles": ["Admin"]` from backend response
2. **Role Detection** → `userRoles = ["Admin"]`
3. **Route Decision** → `userRoles.includes('Admin')` returns `true`
4. **Redirect** → Navigate to `/dashboard/reporting`

## Debug Steps

### 1. Clear Browser Data
```bash
# Clear browser cache, localStorage, and cookies
# Or use incognito/private browsing mode
```

### 2. Login and Check Console
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Login with your admin user
4. Look for these debug messages:
   ```
   User object: {id: "...", userName: "admin", Roles: ["Admin"], ...}
   User roles detected: ["Admin"]
   Admin role detected, redirecting to reporting dashboard
   ```

### 3. Verify Redirect
- Should redirect to: `http://localhost:4200/dashboard/reporting`
- Should load: ReportingDashboardComponent

## Troubleshooting

### If Still Redirecting to Employee Dashboard

**Check Console Logs:**
- If you see `"User roles detected: []"` → Role extraction is failing
- If you see `"No specific role matched"` → Role matching is failing

**Possible Issues:**
1. **localStorage Cache:** Clear browser localStorage
2. **Token Issues:** Check if JWT token is being parsed correctly
3. **Timing Issues:** User object might not be set when getDashboardRoute() is called

### Manual Verification
You can test the role detection manually in browser console:
```javascript
// After login, run this in browser console:
const authService = window.ng.getComponent(document.body).injector.get('AuthService');
console.log('Current user:', authService.getCurrentUser());
console.log('Dashboard route:', authService.getDashboardRoute());
```

## Dashboard Routes Reference
| Role | Expected Route | Component |
|------|---------------|-----------|
| **Admin** | `/dashboard/reporting` | ReportingDashboardComponent |
| HR | `/dashboard/hr` | HRDashboardComponent |
| Manager | `/dashboard/manager` | ManagerDashboardComponent |
| Employee | `/dashboard/employee` | EmployeeDashboardComponent |

## Files Modified
1. `src/app/core/models/auth.models.ts` - Added `Roles?` property
2. `src/app/core/services/auth.service.ts` - Updated role detection logic
3. Added debug logging for troubleshooting

## Next Steps
1. **Clear browser cache/localStorage**
2. **Login with admin user**
3. **Check browser console for debug messages**
4. **Verify redirect to `/dashboard/reporting`**

If you're still having issues, please share the console log output so we can debug further!
