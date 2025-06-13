'use client'

import { useAuth } from '@/contexts/auth-context'
import { useCallback } from 'react'

export function useApi() {
  const { tokens, logout } = useAuth()

  const apiCall = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ) => {
    if (!tokens) {
      throw new Error('No authentication tokens available')
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokens.accessToken}`,
      ...options.headers,
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5250/api'}${url}`, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      // Token inválido, fazer logout
      logout()
      throw new Error('Authentication failed')
    }

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`)
    }

    return response.json()
  }, [tokens, logout])

  return { apiCall }
}