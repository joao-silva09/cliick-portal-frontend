'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, LogIn } from 'lucide-react'
import { Suspense } from 'react'

function LoginContent() {
  const { user, isLoading, login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse">Carregando...</div>
      </div>
    )
  }

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'auth_failed':
        return 'Falha na autenticação. Tente novamente.'
      case 'no_code':
        return 'Código de autorização não encontrado.'
      case 'callback_failed':
        return 'Erro no processo de autenticação.'
      default:
        return 'Erro desconhecido na autenticação.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 to-indigo-100/50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <LogIn className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Cliick Portal</CardTitle>
          <CardDescription>
            Faça login para acessar sua plataforma de gestão
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {getErrorMessage(error)}
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={login}
            className="w-full"
            size="lg"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Entrar com Keycloak
          </Button>
          
          <div className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Ao fazer login, você concorda com nossos Termos de Serviço
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginContent />
    </Suspense>
  )
}