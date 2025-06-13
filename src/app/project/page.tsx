'use client'

import { useState, useEffect } from 'react'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { Plus, Calendar, Users, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Project {
  id: number
  name: string
  description: string
  status: string
  startDate: string
  endDate?: string
  tenantId: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { apiCall } = useApi()
  const router = useRouter()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiCall('/projects')
      setProjects(data)
    } catch (error) {
      console.error('Failed to load projects:', error)
      setError('Falha ao carregar projetos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Loading text="Carregando projetos..." className="py-20" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
                <p className="text-gray-600">
                  Gerencie todos os seus projetos em um só lugar
                </p>
              </div>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Projeto
            </Button>
          </div>

          {/* Error State */}
          {error && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={loadProjects} variant="outline">
                    Tentar Novamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects Grid */}
          {!error && projects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum projeto encontrado
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Comece criando seu primeiro projeto para organizar suas tarefas.
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeiro Projeto
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {new Date(project.startDate).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-1 h-4 w-4" />
                        1 membro
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}