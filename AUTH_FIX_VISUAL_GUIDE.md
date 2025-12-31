# Visual Guide: Session Persistence Fix

## The Problem (Before Fix)

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. USER LOGS IN                                            │
│     ├─ Email: admin@example.com                            │
│     └─ Password: ••••••••                                   │
│          ↓                                                   │
│  2. API CALL /auth/login/                                   │
│          ↓                                                   │
│  3. TOKENS RECEIVED                                         │
│     ├─ access_token: "eyJ0eXAi..."                         │
│     └─ refresh_token: "eyJ0eXAi..."                        │
│          ↓                                                   │
│  4. STORE IN LOCALSTORAGE ✓                                │
│     ├─ localStorage.access_token = "..."                  │
│     ├─ localStorage.refresh_token = "..."                 │
│     └─ localStorage.user = JSON {...}                     │
│          ↓                                                   │
│  5. DISPATCH TO REDUX ✓                                    │
│     └─ auth.isAuthenticated = true                        │
│          ↓                                                   │
│  6. ROUTE PROTECTION ✓                                     │
│     ├─ User can access dashboard                          │
│     └─ User sees protected pages                          │
│                                                              │
│  ⚠️ THEN USER REFRESHES PAGE (F5)                          │
│          ↓                                                   │
│  7. BROWSER RELOADS ❌                                      │
│     ├─ Redux state resets (in-memory only)                │
│     └─ auth.isAuthenticated = false (initial state)       │
│          ↓                                                   │
│  8. localStorage DATA LOST ❌                               │
│     ├─ localStorage still has: access_token ✓             │
│     ├─ localStorage still has: refresh_token ✓            │
│     └─ localStorage still has: user ✓                     │
│     BUT REDUX DOESN'T READ IT! ❌                         │
│          ↓                                                   │
│  9. ROUTE PROTECTION CHECKS REDUX                          │
│     └─ isAuthenticated = false → Redirect to /login      │
│          ↓                                                   │
│  10. USER SEES LOGIN PAGE 😞                               │
│      Tokens still valid in localStorage!                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## The Solution (After Fix)

```
┌─────────────────────────────────────────────────────────────┐
│              APPLICATION FLOW WITH FIX                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. USER LOGS IN                                            │
│     ├─ Email: admin@example.com                            │
│     └─ Password: ••••••••                                   │
│          ↓                                                   │
│  2. API CALL /auth/login/                                   │
│          ↓                                                   │
│  3. TOKENS RECEIVED                                         │
│     ├─ access_token: "eyJ0eXAi..."                         │
│     └─ refresh_token: "eyJ0eXAi..."                        │
│          ↓                                                   │
│  4. STORE IN LOCALSTORAGE ✓                                │
│     ├─ localStorage.access_token = "..."                  │
│     ├─ localStorage.refresh_token = "..."                 │
│     └─ localStorage.user = JSON {...}                     │
│          ↓                                                   │
│  5. DISPATCH TO REDUX ✓                                    │
│     └─ auth.isAuthenticated = true                        │
│          ↓                                                   │
│  6. ROUTE PROTECTION ✓                                     │
│     ├─ User can access dashboard                          │
│     └─ User sees protected pages                          │
│                                                              │
│  ✨ USER REFRESHES PAGE (F5)                               │
│          ↓                                                   │
│  7. BROWSER RELOADS                                        │
│     └─ App.tsx mounts (component lifecycle)                │
│          ↓                                                   │
│  8. ⭐ NEW: useEffect Hook Runs ⭐                         │
│     ├─ Read from localStorage                             │
│     ├─ Check access_token exists ✓                        │
│     ├─ Check refresh_token exists ✓                       │
│     ├─ Check user JSON exists ✓                           │
│          ↓                                                   │
│  9. ⭐ NEW: Parse & Restore to Redux ⭐                   │
│     ├─ dispatch(loginSuccess({user, tokens}))             │
│     └─ auth.isAuthenticated = true ← RESTORED!            │
│          ↓                                                   │
│  10. ROUTE PROTECTION CHECKS REDUX                         │
│      └─ isAuthenticated = true → Allow access             │
│           ↓                                                   │
│  11. USER SEES DASHBOARD 😊                                │
│      Tokens restored from localStorage!                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Code Changes: Side-by-Side Comparison

### BEFORE (App.tsx)
```typescript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'

export default function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  return (
    <Router>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}>
          {/* Protected Routes */}
        </Route>
      </Routes>
    </Router>
  )
}
```

### AFTER (App.tsx)
```typescript
import { useEffect } from 'react'  // ⭐ NEW
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'  // ⭐ Added useDispatch
import type { RootState, AppDispatch } from '@/store'  // ⭐ Added AppDispatch type
import { loginSuccess } from '@/store/slices/authSlice'  // ⭐ NEW
import { STORAGE_KEYS } from '@5data-hrms/shared'  // ⭐ NEW
import type { AuthUser, AuthTokens } from '@5data-hrms/shared'  // ⭐ NEW

export default function App() {
  const dispatch = useDispatch<AppDispatch>()  // ⭐ NEW
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  // ⭐ NEW: Restore authentication state from localStorage on app load
  useEffect(() => {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    const userJson = localStorage.getItem(STORAGE_KEYS.USER)

    if (accessToken && refreshToken && userJson) {
      try {
        const user: AuthUser = JSON.parse(userJson)
        const tokens: AuthTokens = {
          access: accessToken,
          refresh: refreshToken,
        }
        dispatch(loginSuccess({ user, tokens }))
      } catch (error) {
        console.error('Failed to restore authentication state:', error)
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)
      }
    }
  }, [dispatch])  // ⭐ NEW: Runs once on mount

  return (
    <Router>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}>
          {/* Protected Routes */}
        </Route>
      </Routes>
    </Router>
  )
}
```

## Data Flow Diagram

```
┌──────────────┐
│ localStorage │
└──────┬───────┘
       │
       ├─ access_token: "eyJ0eXAi..."
       ├─ refresh_token: "eyJ0eXAi..."
       └─ user: {"id": 1, "email": "admin@example.com", ...}
       │
       │ ⭐ NEW useEffect reads from here
       ↓
┌──────────────────┐
│  App.tsx Mount   │
│  useEffect runs  │
└────────┬─────────┘
         │
         ├─ getItem('access_token')
         ├─ getItem('refresh_token')
         └─ getItem('user')
         │
         ↓
┌──────────────────────────────┐
│ Parse & Validate Data        │
│ Create tokens object         │
│ Parse user JSON              │
└────────┬─────────────────────┘
         │
         ├─ if (accessToken && refreshToken && userJson)
         │     try {
         │       dispatch(loginSuccess({user, tokens}))
         │     }
         │
         ↓
┌──────────────────────┐
│  Redux Store Update  │
│  (authSlice)         │
└────────┬─────────────┘
         │
         ├─ auth.user = user
         ├─ auth.tokens = tokens
         └─ auth.isAuthenticated = true  ⭐ KEY UPDATE
         │
         ↓
┌──────────────────────┐
│ Route Protection     │
│ Checks Redux State   │
└────────┬─────────────┘
         │
         ├─ if (isAuthenticated === true)
         │     render <MainLayout />
         │ else
         │     redirect to /login
         │
         ↓
┌──────────────────────┐
│ User Sees Dashboard  │
│ (Protected Content)  │
└──────────────────────┘
```

## State Timeline

```
TIME         REDUX STATE              LOCALSTORAGE         ACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           ┌─────────────┐
T0         │isAuth: false│            empty               App loads
           └─────────────┘
           
           ┌─────────────┐
T1         │isAuth: false│            ⭐ useEffect        User input
           └─────────────┘            reads tokens
           
           ┌─────────────┐
T2         │isAuth: false│            ⭐ tokens found     If check
           └─────────────┘
           
           ┌─────────────┐
T3         │isAuth: false│            ⭐ data parsed      Parse JSON
           └─────────────┘
           
           ┌─────────────┐
T4         │isAuth: true ├─ ⭐ UPDATE! │ tokens & user     dispatch()
           └─────────────┘            
           
           ┌─────────────┐
T5         │isAuth: true │            tokens & user      Routes render
           └─────────────┘            
           
           ┌─────────────┐
T6         │isAuth: true │            tokens & user      Dashboard shows!
           └─────────────┘            
```

## Error Handling

```
SCENARIO 1: Valid Tokens in localStorage
├─ Check all 3 items exist ✓
├─ Try to parse user JSON ✓
├─ Dispatch loginSuccess ✓
└─ User stays logged in ✓

SCENARIO 2: Missing Token
├─ Check all 3 items exist ❌ (one or more missing)
├─ Skip restoration
└─ User sees login page (normal) ✓

SCENARIO 3: Corrupted User JSON
├─ Check all 3 items exist ✓
├─ Try to parse user JSON ❌ (invalid JSON)
├─ Catch error & log it
├─ Clear ALL localStorage entries
└─ User sees login page (fresh) ✓

SCENARIO 4: Token Expired (optional enhancement)
├─ Tokens restored from localStorage
├─ API request uses token
├─ Backend returns 401 Unauthorized
├─ api.ts refreshes token automatically
├─ If refresh fails: logout & redirect to login ✓
```

## Testing Checklist

- [ ] Login successfully
- [ ] Refresh page with F5/Cmd+R
- [ ] Verify you're still logged in
- [ ] Check localStorage in DevTools
- [ ] Verify tokens are still present
- [ ] Click around app - navigation works
- [ ] Close tab and reopen app
- [ ] Verify auto-login works
- [ ] Test logout - localStorage clears
- [ ] Refresh after logout - back to login page

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Session Persistence** | ❌ Lost on refresh | ✅ Maintained |
| **localStorage Usage** | Written, never read | ✅ Written & read |
| **Redux Sync** | Out of sync on reload | ✅ Synced automatically |
| **User Experience** | Logged out abruptly | ✅ Seamless session |
| **Files Changed** | - | 1 file (App.tsx) |
| **Breaking Changes** | - | None |
| **Security Impact** | - | None |
| **Performance Impact** | - | Negligible |

