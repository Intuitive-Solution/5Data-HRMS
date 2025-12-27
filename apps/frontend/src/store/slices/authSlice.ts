import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthState, AuthUser, AuthTokens } from '@5data-hrms/shared'

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    loginSuccess: (state, action: PayloadAction<{ user: AuthUser; tokens: AuthTokens }>) => {
      state.user = action.payload.user
      state.tokens = action.payload.tokens
      state.isAuthenticated = true
      state.isLoading = false
      state.error = null
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
      state.isAuthenticated = false
    },
    logout: (state) => {
      state.user = null
      state.tokens = null
      state.isAuthenticated = false
      state.error = null
    },
    refreshTokenSuccess: (state, action: PayloadAction<AuthTokens>) => {
      state.tokens = action.payload
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload
    },
  },
})

export const {
  setLoading,
  setError,
  loginSuccess,
  loginFailure,
  logout,
  refreshTokenSuccess,
  setUser,
} = authSlice.actions

export default authSlice.reducer

