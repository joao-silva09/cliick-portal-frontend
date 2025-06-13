'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthService } from '@/lib/auth'
import { User, AuthTokens, AuthState } from '@/types/auth'

interface AuthContextType extends AuthState {
  login: () => void
  logout: () => void
  getTenant: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const publicPaths = ['/login', '/auth/callback', '/']

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    tokens: null,
    isLoading: true,
    tenant: null,
  })
  
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    initializeAuth()
  }, [])

  useEffect(() => {
    // Redirecionar se não autenticado em páginas protegidas
    if (!authState.isLoading && !authState.user && !publicPaths.includes(pathname)) {
      router.push('/login')
    }
  }, [authState.isLoading, authState.user, pathname, router])

  const initializeAuth = async () => {
    try {
      const tokens = AuthService.getTokens()
      const user = AuthService.getUser()

      if (tokens && user) {
        // Verificar se o token ainda é válido
        if (!AuthService.isTokenExpired(tokens.accessToken)) {
          setAuthState({
            user,
            tokens,
            isLoading: false,
            tenant: user.groups[0] || null,
          })
        } else if (tokens.refreshToken) {
          // Tentar refresh do token
          await refreshAuth(tokens.refreshToken)
        } else {
          clearAuth()
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      clearAuth()
    }
  }

  const refreshAuth = async (refreshToken: string) => {
    try {
      const newTokens = await AuthService.refreshTokens(refreshToken)
      const user = AuthService.saveAuth(newTokens)
      
      setAuthState({
        user,
        tokens: newTokens,
        isLoading: false,
        tenant: user.groups[0] || null,
      })
    } catch (error) {
      console.error('Token refresh error:', error)
      clearAuth()
    }
  }

  const login = () => {
    const loginUrl = AuthService.getLoginUrl()
    window.location.href = loginUrl
  }

  const logout = () => {
    clearAuth()
    const logoutUrl = AuthService.getLogoutUrl()
    window.location.href = logoutUrl
  }

  const clearAuth = () => {
    AuthService.clearAuth()
    setAuthState({
      user: null,
      tokens: null,
      isLoading: false,
      tenant: null,
    })
  }

  const getTenant = () => {
    return authState.tenant
  }

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      getTenant,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}