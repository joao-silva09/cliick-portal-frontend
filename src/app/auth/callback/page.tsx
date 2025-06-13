'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthService } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
          console.error('Auth error:', error)
          router.push('/login?error=auth_failed')
          return
        }

        if (!code) {
          router.push('/login?error=no_code')
          return
        }

        console.log('Received authorization code, exchanging for tokens...')

        // Trocar código por tokens
        const tokens = await AuthService.exchangeCodeForTokens(code)
        const user = AuthService.saveAuth(tokens)

        console.log('Authentication successful, user:', user)

        // Redirecionar para dashboard
        router.push('/dashboard')
      } catch (error) {
        console.error('Callback error:', error)
        router.push('/login?error=callback_failed')
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-96">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">
            Finalizando autenticação...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}