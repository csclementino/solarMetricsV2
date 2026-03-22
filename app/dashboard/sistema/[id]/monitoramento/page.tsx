"use client"

import { useEffect, useState, useRef, use, useCallback } from 'react'
import { useSystem } from '@/contexts/system-context'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { MqttClient } from 'mqtt'
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Gauge,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface PageProps {
  params: Promise<{ id: string }>
}

interface RealtimeData {
  time: string
  geracao: number
  consumo: number
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export default function MonitoramentoPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const { selectedSystem } = useSystem()
  const { accessToken } = useAuth()
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [realtimeData, setRealtimeData] = useState<RealtimeData[]>([])
  const [currentGeneration, setCurrentGeneration] = useState(0)
  const [currentConsumption, setCurrentConsumption] = useState(0)
  const mqttClientRef = useRef<MqttClient | null>(null)

  const BROKER_URL = 'wss://mqtt.grouparc.com.br:8084/mqtt'
  const PASSWORD = 'solarmetrics'

  const connectMQTT = useCallback(async () => {
    if (!accessToken || !resolvedParams.id) {
      setConnectionStatus('error')
      return
    }

    try {
      if (mqttClientRef.current) {
        mqttClientRef.current.end(true)
      }

      setConnectionStatus('connecting')

      const topic = `devices/${resolvedParams.id}/realtime`

      // Dynamic import for mqtt library
      const mqtt = await import('mqtt')
      
      const client = mqtt.default.connect(BROKER_URL, {
        username: accessToken,
        password: PASSWORD,
        clientId: `solarmetrics_${resolvedParams.id}_${Date.now()}`,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 30000,
      })

      mqttClientRef.current = client

      client.on('connect', () => {
        setConnectionStatus('connected')
        client.subscribe(topic, { qos: 1 }, (err) => {
          if (err) {
            console.error('Erro ao se inscrever no topico:', err)
          }
        })
      })

      client.on('message', (_topic, message) => {
        try {
          const data = JSON.parse(message.toString())
          const now = new Date()
          const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

          const geracao = parseFloat(data.geracao || data.generation || data.power || 0)
          const consumo = parseFloat(data.consumo || data.consumption || 0)

          setCurrentGeneration(geracao)
          setCurrentConsumption(consumo)

          setRealtimeData(prev => {
            const newData = [...prev, { time: timeStr, geracao, consumo }]
            return newData.slice(-20)
          })
        } catch (err) {
          console.error('Erro ao processar mensagem MQTT:', err)
        }
      })

      client.on('error', (err) => {
        console.error('Erro MQTT:', err)
        setConnectionStatus('error')
      })

      client.on('close', () => {
        setConnectionStatus('disconnected')
      })

      client.on('reconnect', () => {
        setConnectionStatus('connecting')
      })

      client.on('offline', () => {
        setConnectionStatus('disconnected')
      })

    } catch (err) {
      console.error('Erro ao conectar MQTT:', err)
      setConnectionStatus('error')
    }
  }, [accessToken, resolvedParams.id])

  const disconnectMQTT = () => {
    if (mqttClientRef.current) {
      mqttClientRef.current.end(true)
      mqttClientRef.current = null
    }
    setConnectionStatus('disconnected')
  }

  useEffect(() => {
    return () => {
      if (mqttClientRef.current) {
        mqttClientRef.current.end(true)
      }
    }
  }, [])

  if (!selectedSystem) {
    return null
  }

  const isConnected = connectionStatus === 'connected'
  const generationPercentage = selectedSystem.potenciaTotal > 0
    ? Math.min(100, (currentGeneration / selectedSystem.potenciaTotal) * 100)
    : 0

  const energyBalance = currentGeneration - currentConsumption
  const isPositiveBalance = energyBalance >= 0

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return { bg: 'bg-green-500', text: 'Conectado', icon: <Wifi className="h-3 w-3" /> }
      case 'connecting':
        return { bg: 'bg-primary', text: 'Conectando', icon: <Loader2 className="h-3 w-3 animate-spin" /> }
      case 'error':
        return { bg: 'bg-destructive', text: 'Erro', icon: <WifiOff className="h-3 w-3" /> }
      default:
        return { bg: 'bg-muted-foreground', text: 'Desconectado', icon: <WifiOff className="h-3 w-3" /> }
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monitoramento em Tempo Real</h1>
          <p className="text-muted-foreground">Acompanhe a geracao e consumo do seu sistema</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white ${statusConfig.bg}`}>
            {statusConfig.icon}
            <span>{statusConfig.text}</span>
          </div>

          {isConnected ? (
            <Button variant="outline" size="sm" onClick={disconnectMQTT}>
              <WifiOff className="mr-2 h-4 w-4" />
              Desconectar
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={connectMQTT}
              disabled={connectionStatus === 'connecting'}
            >
              {connectionStatus === 'connecting' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wifi className="mr-2 h-4 w-4" />
              )}
              Conectar
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Current Generation */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Geracao Atual</p>
                <p className="text-3xl font-bold text-primary">
                  {isConnected ? `${currentGeneration.toFixed(2)} kW` : '-- kW'}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Consumption */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consumo Atual</p>
                <p className="text-3xl font-bold text-foreground">
                  {isConnected ? `${currentConsumption.toFixed(2)} kW` : '-- kW'}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                <Activity className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generation Percentage */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Porcentagem de Geracao</p>
                <p className="text-3xl font-bold text-foreground">
                  {isConnected ? `${generationPercentage.toFixed(1)}%` : '--%'}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Gauge className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-3">
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all duration-500"
                  style={{ width: isConnected ? `${generationPercentage}%` : '0%' }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Capacidade: {selectedSystem.potenciaTotal} kW
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Energy Balance */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo de Energia</p>
                <p className={`text-3xl font-bold ${isConnected ? (isPositiveBalance ? 'text-green-500' : 'text-destructive') : 'text-muted-foreground'}`}>
                  {isConnected ? `${isPositiveBalance ? '+' : ''}${energyBalance.toFixed(2)} kW` : '-- kW'}
                </p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isConnected ? (isPositiveBalance ? 'bg-green-500/10' : 'bg-destructive/10') : 'bg-muted'}`}>
                {isPositiveBalance ? (
                  <TrendingUp className={`h-6 w-6 ${isConnected ? 'text-green-500' : 'text-muted-foreground'}`} />
                ) : (
                  <TrendingDown className={`h-6 w-6 ${isConnected ? 'text-destructive' : 'text-muted-foreground'}`} />
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {isConnected
                ? (isPositiveBalance ? 'Voce esta gerando mais do que consumindo' : 'Voce esta consumindo mais do que gerando')
                : 'Conecte para ver o saldo'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Grafico em Tempo Real
          </CardTitle>
          <CardDescription>
            {isConnected ? 'Geracao e consumo de energia nos ultimos minutos' : 'Conecte ao sistema para visualizar os dados'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={realtimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="time"
                  stroke="var(--muted-foreground)"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  unit=" kW"
                  domain={[0, 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--card-foreground)'
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)} kW`]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="geracao"
                  name="Geracao"
                  stroke="#f0ba3e"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="consumo"
                  name="Consumo"
                  stroke="#22293e"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
