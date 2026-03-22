"use client"

import { useEffect, useState, use } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useSystem } from '@/contexts/system-context'
import { api, type Sensor, type Painel } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Zap, 
  Calendar, 
  Power, 
  Cpu, 
  MapPin, 
  Radio,
  Sun,
  Factory,
  Gauge
} from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function SistemaResumoPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const { accessToken } = useAuth()
  const { selectedSystem } = useSystem()
  const [sensor, setSensor] = useState<Sensor | null>(null)
  const [paineis, setPaineis] = useState<Painel[]>([])
  const [loadingSensor, setLoadingSensor] = useState(true)
  const [loadingPaineis, setLoadingPaineis] = useState(true)

  useEffect(() => {
    if (accessToken && resolvedParams.id) {
      loadSensor()
      loadPaineis()
    }
  }, [accessToken, resolvedParams.id])

  const loadSensor = async () => {
    if (!accessToken) return
    setLoadingSensor(true)
    try {
      const data = await api.getSensoresBySistema(resolvedParams.id, accessToken)
      setSensor(data)
    } catch (err) {
      console.error('[v0] Error loading sensor:', err)
      setSensor(null)
    } finally {
      setLoadingSensor(false)
    }
  }

  const loadPaineis = async () => {
    if (!accessToken) return
    setLoadingPaineis(true)
    try {
      const data = await api.getPaineisBySistema(resolvedParams.id, accessToken)
      setPaineis(data || [])
    } catch (err) {
      console.error('[v0] Error loading paineis:', err)
      setPaineis([])
    } finally {
      setLoadingPaineis(false)
    }
  }

  if (!selectedSystem) {
    return null
  }

  const totalPotenciaPaineis = paineis.reduce((sum, p) => sum + p.potenciaMaxima, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Resumo do Sistema</h1>
        <p className="text-muted-foreground">Informacoes detalhadas do sistema selecionado</p>
      </div>

      {/* System Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Potencia Total</p>
              <p className="text-2xl font-bold text-foreground">{selectedSystem.potenciaTotal} kW</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data de Instalacao</p>
              <p className="text-2xl font-bold text-foreground">
                {new Date(selectedSystem.dataInstalacao).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <Power className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className={`text-2xl font-bold ${
                selectedSystem.status === 'ATIVO' ? 'text-green-500' : 'text-muted-foreground'
              }`}>
                {selectedSystem.status}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Sun className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paineis</p>
              <p className="text-2xl font-bold text-foreground">{paineis.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Info */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Informacoes do Sistema
            </CardTitle>
            <CardDescription>Detalhes gerais da instalacao</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">Nome da Instalacao</span>
              <span className="font-medium text-foreground">{selectedSystem.nomeInstalacao}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">Potencia Total</span>
              <span className="font-medium text-foreground">{selectedSystem.potenciaTotal} kW</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">Data de Instalacao</span>
              <span className="font-medium text-foreground">
                {new Date(selectedSystem.dataInstalacao).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className={`flex items-center gap-2 font-medium ${
                selectedSystem.status === 'ATIVO' ? 'text-green-500' : 'text-muted-foreground'
              }`}>
                <span className={`h-2 w-2 rounded-full ${
                  selectedSystem.status === 'ATIVO' ? 'bg-green-500' : 'bg-muted-foreground'
                }`} />
                {selectedSystem.status}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Sensor Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              Sensor Vinculado
            </CardTitle>
            <CardDescription>Informacoes do sensor conectado</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSensor ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : sensor ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Radio className="h-4 w-4" />
                    ID do Sensor
                  </span>
                  <span className="font-mono text-sm font-medium text-foreground">{sensor.id}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Cpu className="h-4 w-4" />
                    Tipo
                  </span>
                  <span className="font-medium text-foreground">{sensor.tipo}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Localizacao
                  </span>
                  <span className="font-medium text-foreground">{sensor.localizacao}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`flex items-center gap-2 font-medium ${
                    sensor.status === 'ATIVO' ? 'text-green-500' : 'text-muted-foreground'
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${
                      sensor.status === 'ATIVO' ? 'bg-green-500' : 'bg-muted-foreground'
                    }`} />
                    {sensor.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Cpu className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Nenhum sensor vinculado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Panels Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-primary" />
                Paineis Solares
              </CardTitle>
              <CardDescription>Lista de paineis vinculados ao sistema</CardDescription>
            </div>
            {paineis.length > 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Potencia Total</p>
                <p className="text-xl font-bold text-primary">{totalPotenciaPaineis} W</p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingPaineis ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : paineis.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paineis.map((painel, index) => (
                <Card key={index} className="border-border bg-muted/30">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Sun className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{painel.modelo}</p>
                        <p className="text-xs text-muted-foreground">Painel {index + 1}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Factory className="h-3 w-3" />
                          Fabricante
                        </span>
                        <span className="font-medium text-foreground">{painel.fabricante}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Gauge className="h-3 w-3" />
                          Potencia Max
                        </span>
                        <span className="font-medium text-primary">{painel.potenciaMaxima} W</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Sun className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhum painel cadastrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
