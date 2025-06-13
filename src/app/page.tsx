'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogIn } from 'lucide-react'

export default function Home() {
  const { user, isLoading, login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Carregando...</div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold">Bem-vindo ao Cliick Portal</h1>
        <p className="text-muted-foreground">
          Faça login para acessar seu painel.
        </p>
        <Button onClick={login} size="lg">
          <LogIn className="mr-2 h-4 w-4" />
          Entrar com Keycloak
        </Button>
      </div>
    </main>
  )
}