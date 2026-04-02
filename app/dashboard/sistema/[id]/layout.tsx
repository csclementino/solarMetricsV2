"use client"

import { useEffect, useState, use } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { api, type Sistema } from '@/lib/api'
import { SystemProvider, useSystem } from '@/contexts/system-context'
import { Button } from '@/components/ui/button'
import { 
  Sun, 
  LayoutDashboard, 
  Activity, 
  History, 
  ArrowLeft,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface SystemLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

function SystemLayoutContent({ 
  children, 
  sistemaId 
}: { 
  children: React.ReactNode
  sistemaId: string 
}) {
  const { user, accessToken, isAuthenticated, isLoading, logout } = useAuth()
  const { selectedSystem, setSelectedSystem } = useSystem()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (accessToken && sistemaId && !selectedSystem) {
      loadSistema()
    }
  }, [accessToken, sistemaId, selectedSystem])

  const loadSistema = async () => {
    if (!accessToken) return
    try {
      const data = await api.getSistema(sistemaId, accessToken)
      setSelectedSystem({ ...data, id: sistemaId })
    } catch (err) {
      console.error('[v0] Error loading sistema:', err)
      router.push('/dashboard')
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const navItems = [
    {
      href: `/dashboard/sistema/${sistemaId}`,
      label: 'Resumo',
      icon: LayoutDashboard
    },
    {
      href: `/dashboard/sistema/${sistemaId}/monitoramento`,
      label: 'Monitoramento',
      icon: Activity
    },
    {
      href: `/dashboard/sistema/${sistemaId}/historico`,
      label: 'Historico',
      icon: History
    }
  ]

  if (isLoading || !selectedSystem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Carregando sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex items-center">
                <Image 
                  src="/logo-maior.svg" 
                  alt="SolarMetrics" 
                  width={130} 
                  height={18} 
                  priority
                />
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* System Info */}
          <div className="border-b border-sidebar-border p-4">
            <p className="text-xs text-sidebar-foreground/60">Sistema Selecionado</p>
            <p className="font-semibold text-sidebar-foreground">{selectedSystem.nomeInstalacao}</p>
            <p className="text-sm text-sidebar-foreground/80">{selectedSystem.potenciaTotal} W</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-sidebar-border p-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar aos Sistemas
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-foreground">{selectedSystem.nomeInstalacao}</h1>
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
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function SystemLayout({ children, params }: SystemLayoutProps) {
  const resolvedParams = use(params)
  
  return (
    <SystemProvider>
      <SystemLayoutContent sistemaId={resolvedParams.id}>
        {children}
      </SystemLayoutContent>
    </SystemProvider>
  )
}
