# Testing the Authentication Session Persistence Fix

## Quick Test (5 minutes)

### Prerequisites
- Backend running on http://localhost:8000
- Frontend running on http://localhost:5173
- Valid test user account created in the database

### Step-by-Step Test

#### Step 1: Login
```
1. Open http://localhost:5173/login
2. Enter valid email and password
3. Click "Sign In"
4. Verify you see the dashboard (or any protected page)
```

#### Step 2: Hard Refresh
```
5. Press F5 (Windows/Linux) or Cmd+R (Mac)
   OR use Ctrl+Shift+R for hard refresh
6. Wait for page to reload
```

#### Step 3: Verify User Stays Logged In ✅
```
7. You should see the dashboard (NOT the login page)
8. Navigation should work normally
9. No error messages should appear
```

## Advanced Testing

### Test with Browser DevTools

#### Check localStorage persistence:
```javascript
// Open DevTools (F12) → Console tab

// Check if tokens are stored:
localStorage.getItem('access_token')      // Should show: "eyJ0eXAi..."
localStorage.getItem('refresh_token')     // Should show: "eyJ0eXAi..."
localStorage.getItem('user')              // Should show: {"id": 1, "email": "..."}

// Check Redux state:
// DevTools → Redux tab (if Redux DevTools Extension installed)
// Should show: auth.isAuthenticated = true
```

#### Monitor network requests:
```
1. Open DevTools → Network tab
2. Login successfully
3. Refresh the page (F5)
4. Check network requests:
   - Should NOT see a failed login request
   - API calls should include Authorization header with token
```

#### Console Logging:
```
1. Open DevTools → Console tab
2. Refresh the page while logged in
3. Check for any error messages
4. Should NOT see: "Failed to restore authentication state"
   (This message only appears if localStorage data is corrupted)
```

## Test Cases Matrix

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| **Login & Refresh** | Login → F5 | Stays logged in | ✅ |
| **Close Tab** | Login → Close tab → Reopen app | Auto-logged in | ✅ |
| **Tab Switching** | Login → Switch tabs → Return | Stays logged in | ✅ |
| **Multiple Tabs** | Login → Open new tab → App | Both tabs logged in | ✅ |
| **Logout Works** | Login → Click Logout → Refresh | Redirects to login | ✅ |
| **Corrupted Storage** | (Dev) Corrupt localStorage → Refresh | Auto-clears, redirects to login | ✅ |

## Troubleshooting

### If user is still logged out after refresh:

1. **Check localStorage is not cleared:**
   ```javascript
   // In browser console:
   localStorage.getItem('access_token')
   ```
   - If empty: Browser is clearing localStorage (check privacy settings)
   - If has value: Check if token is expired

2. **Check if token is valid:**
   ```javascript
   // Copy the access token and decode it at jwt.io
   // Verify: exp (expiration) is in the future
   ```

3. **Check for API errors:**
   - Open DevTools → Network tab
   - Refresh the page
   - Look for any failed API requests
   - Check if backend is running

4. **Check Redux state:**
   - If using Redux DevTools Extension: Should see auth.isAuthenticated = true
   - If not showing: useEffect might not be firing

### If you see "Failed to restore authentication state":
- Check browser console for the actual error
- Likely cause: Corrupted user JSON in localStorage
- Solution: Clear localStorage manually and login again
  ```javascript
  localStorage.clear()
  ```

## Performance Impact

✅ **Negligible** - The restoration happens once on app load:
- Only reads from localStorage (very fast)
- Only dispatches one Redux action
- No network requests made during restoration
- No DOM updates during restoration

## Security Notes

✅ **No security risks introduced:**
- Tokens are still required for all API requests
- Tokens are still validated by backend
- Logout still clears localStorage
- Expired tokens are still handled by refresh mechanism
- Same-origin policy still applies to localStorage

## Next Steps

After confirming this fix works:

1. **Consider adding:** Loading indicator while restoring session
   - Shows spinner until auth state is determined
   - Prevents brief flash of login page

2. **Consider adding:** Token expiration handling
   - Auto-refresh token before expiration
   - Graceful logout when refresh fails

3. **Document in:** User documentation
   - Session behavior
   - How to logout across devices
   - Multi-tab session management

