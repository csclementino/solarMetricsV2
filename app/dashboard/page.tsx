"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { api, type Sistema } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Sun, Plus, Trash2, Eye, LogOut, Zap, Calendar, Power } from 'lucide-react'

export default function DashboardPage() {
  const { user, accessToken, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const [sistemas, setSistemas] = useState<Sistema[]>([])
  const [loadingSistemas, setLoadingSistemas] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sistemaToDelete, setSistemaToDelete] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  
  const [newSistema, setNewSistema] = useState({
    nomeInstalacao: '',
    dataInstalacao: '',
    potenciaTotal: '',
    status: 'ATIVO' as 'ATIVO' | 'INATIVO'
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user && accessToken) {
      loadSistemas()
    }
  }, [user, accessToken])

  const loadSistemas = async () => {
    if (!user || !accessToken) return
    
    setLoadingSistemas(true)
    try {
      const data = await api.getSistemasByCliente(user.id, accessToken)
      setSistemas(data || [])
    } catch (err) {
      console.error('[v0] Error loading sistemas:', err)
      setSistemas([])
    } finally {
      setLoadingSistemas(false)
    }
  }

  const handleCreateSistema = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !accessToken) return
    
    setIsCreating(true)
    setError('')

    try {
      await api.createSistema({
        nomeInstalacao: newSistema.nomeInstalacao,
        dataInstalacao: newSistema.dataInstalacao,
        potenciaTotal: parseFloat(newSistema.potenciaTotal),
        status: newSistema.status,
        clienteId: user.id
      }, accessToken)
      
      setIsCreateDialogOpen(false)
      setNewSistema({
        nomeInstalacao: '',
        dataInstalacao: '',
        potenciaTotal: '',
        status: 'ATIVO'
      })
      await loadSistemas()
    } catch {
      setError('Erro ao criar sistema. Tente novamente.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteSistema = async () => {
    if (!sistemaToDelete || !accessToken) return
    
    setIsDeleting(true)
    try {
      await api.deleteSistema(sistemaToDelete, accessToken)
      setSistemas(sistemas.filter(s => s.id !== sistemaToDelete))
      setDeleteDialogOpen(false)
      setSistemaToDelete(null)
    } catch {
      setError('Erro ao deletar sistema.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSelectSistema = (sistema: Sistema) => {
    router.push(`/dashboard/sistema/${sistema.id}`)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Sun className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SolarMetrics</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">{user?.nome}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meus Sistemas</h1>
            <p className="text-muted-foreground">Gerencie seus sistemas de energia solar</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Novo Sistema
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Sistema</DialogTitle>
                <DialogDescription>
                  Preencha os dados do seu sistema de energia solar
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateSistema} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="nome" className="text-sm font-medium text-foreground">
                    Nome da Instalacao
                  </label>
                  <Input
                    id="nome"
                    placeholder="Ex: Casa, Apartamento, Empresa"
                    value={newSistema.nomeInstalacao}
                    onChange={(e) => setNewSistema({ ...newSistema, nomeInstalacao: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="data" className="text-sm font-medium text-foreground">
                    Data de Instalacao
                  </label>
                  <Input
                    id="data"
                    type="date"
                    value={newSistema.dataInstalacao}
                    onChange={(e) => setNewSistema({ ...newSistema, dataInstalacao: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="potencia" className="text-sm font-medium text-foreground">
                    Potencia Total (W)
                  </label>
                  <Input
                    id="potencia"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 5.5"
                    value={newSistema.potenciaTotal}
                    onChange={(e) => setNewSistema({ ...newSistema, potenciaTotal: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium text-foreground">
                    Status
                  </label>
                  <Select
                    value={newSistema.status}
                    onValueChange={(value: 'ATIVO' | 'INATIVO') => setNewSistema({ ...newSistema, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ATIVO">Ativo</SelectItem>
                      <SelectItem value="INATIVO">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isCreating}
                  >
                    {isCreating ? 'Criando...' : 'Criar Sistema'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Systems Grid */}
        {loadingSistemas ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-muted-foreground">Carregando sistemas...</p>
            </div>
          </div>
        ) : sistemas.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Sun className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Nenhum sistema cadastrado</h3>
              <p className="mb-4 text-center text-muted-foreground">
                Comece adicionando seu primeiro sistema de energia solar
              </p>
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Sistema
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sistemas.map((sistema) => (
              <Card key={sistema.id} className="group transition-shadow hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{sistema.nomeInstalacao}</CardTitle>
                        <CardDescription className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3" />
                          {new Date(sistema.dataInstalacao).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      sistema.status === 'ATIVO' 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <Power className="h-3 w-3" />
                      {sistema.status}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">Potencia Total</p>
                    <p className="text-2xl font-bold text-foreground">{sistema.potenciaTotal} W</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => handleSelectSistema(sistema)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        setSistemaToDelete(sistema.id)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusao</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este sistema? Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSistema}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
