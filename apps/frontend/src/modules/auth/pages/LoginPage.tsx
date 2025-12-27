import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/store'
import api from '@/services/api'
import { loginSuccess, loginFailure, setLoading } from '@/store/slices/authSlice'
import { STORAGE_KEYS } from '@5data-hrms/shared'
import type { LoginResponse } from '@5data-hrms/shared'

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    dispatch(setLoading(true))

    try {
      const response = await api.post<LoginResponse>('/auth/login/', {
        email,
        password,
      })

      const { tokens, user } = response.data

      // Store tokens
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

      // Update Redux
      dispatch(loginSuccess({ user, tokens }))

      // Redirect to dashboard
      navigate('/')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Login failed'
      setError(errorMessage)
      dispatch(loginFailure(errorMessage))
    } finally {
      setIsLoading(false)
      dispatch(setLoading(false))
    }
  }

  return (
    <div className="card space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">5Data HRMS</h1>
        <p className="text-text-secondary mt-2">Sign in to your account</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-card">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="your@email.com"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="••••••••"
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className={`w-full btn-primary ${isLoading ? 'btn-disabled' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center text-sm text-text-secondary">
        Forgot your password?{' '}
        <a href="#" className="text-primary hover:text-primary-hover">
          Reset it here
        </a>
      </div>
    </div>
  )
}

