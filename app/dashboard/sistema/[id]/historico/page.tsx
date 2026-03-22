"use client"

import { useSystem } from '@/contexts/system-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  History,
  Zap,
  TrendingUp,
  Clock,
  Thermometer,
  Sun,
  Battery,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from 'recharts'

// Mock historical data for the last 6 days
function getHistoricalData() {
  const today = new Date()
  const data = []
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    
    // Simulate realistic data based on day
    const baseGeneration = 25 + Math.random() * 15
    const weatherFactor = 0.7 + Math.random() * 0.3
    const totalGeracao = parseFloat((baseGeneration * weatherFactor).toFixed(2))
    
    const baseConsumption = isWeekend ? 30 : 22
    const totalConsumo = parseFloat((baseConsumption + Math.random() * 10).toFixed(2))
    
    const peakHour = 11 + Math.floor(Math.random() * 3)
    const peakMinute = Math.floor(Math.random() * 60)
    
    const temperaturaMedia = 22 + Math.random() * 10
    
    data.push({
      date: date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }),
      fullDate: date.toLocaleDateString('pt-BR'),
      totalGeracao,
      totalConsumo,
      horarioPico: `${peakHour.toString().padStart(2, '0')}:${peakMinute.toString().padStart(2, '0')}`,
      temperaturaMedia: parseFloat(temperaturaMedia.toFixed(1)),
      eficiencia: parseFloat(((totalGeracao / 40) * 100).toFixed(1)),
      economiaEstimada: parseFloat((totalGeracao * 0.75).toFixed(2)),
      co2Evitado: parseFloat((totalGeracao * 0.5).toFixed(2)),
      horasSol: parseFloat((6 + Math.random() * 4).toFixed(1))
    })
  }
  
  return data
}

export default function HistoricoPage() {
  const { selectedSystem } = useSystem()
  const historicalData = getHistoricalData()

  if (!selectedSystem) {
    return null
  }

  // Calculate totals
  const totalGeracao = historicalData.reduce((sum, d) => sum + d.totalGeracao, 0)
  const totalConsumo = historicalData.reduce((sum, d) => sum + d.totalConsumo, 0)
  const avgTemperatura = historicalData.reduce((sum, d) => sum + d.temperaturaMedia, 0) / historicalData.length
  const totalEconomia = historicalData.reduce((sum, d) => sum + d.economiaEstimada, 0)
  const totalCo2 = historicalData.reduce((sum, d) => sum + d.co2Evitado, 0)

  // Find peak day
  const peakDay = historicalData.reduce((max, d) => d.totalGeracao > max.totalGeracao ? d : max, historicalData[0])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Historico de Geracao</h1>
        <p className="text-muted-foreground">Dados dos ultimos 7 dias do sistema</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Gerado</p>
                <p className="text-3xl font-bold text-primary">{totalGeracao.toFixed(1)} kWh</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-green-500">
                  <ArrowUp className="h-3 w-3" />
                  +12% vs semana anterior
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Consumido</p>
                <p className="text-3xl font-bold text-foreground">{totalConsumo.toFixed(1)} kWh</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <ArrowDown className="h-3 w-3" />
                  -5% vs semana anterior
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                <Battery className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Economia Estimada</p>
                <p className="text-3xl font-bold text-green-500">R$ {totalEconomia.toFixed(2)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Baseado na tarifa media
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CO2 Evitado</p>
                <p className="text-3xl font-bold text-foreground">{totalCo2.toFixed(1)} kg</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Contribuicao ambiental
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Sun className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Generation vs Consumption Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Geracao vs Consumo
            </CardTitle>
            <CardDescription>Comparativo diario em kWh</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--muted-foreground)"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    unit=" kWh"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--card-foreground)'
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)} kWh`]}
                  />
                  <Legend />
                  <Bar 
                    dataKey="totalGeracao" 
                    name="Geracao"
                    fill="#f0ba3e" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="totalConsumo" 
                    name="Consumo"
                    fill="#c55f4c" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Temperature Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-primary" />
              Temperatura Media
            </CardTitle>
            <CardDescription>Temperatura ambiente em C</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--muted-foreground)"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    unit="C"
                    domain={['dataMin - 2', 'dataMax + 2']}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--card-foreground)'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}C`]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="temperaturaMedia" 
                    name="Temperatura"
                    stroke="#e9a812" 
                    strokeWidth={2}
                    dot={{ fill: '#e9a812', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Detalhes Diarios
          </CardTitle>
          <CardDescription>Informacoes completas de cada dia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Data</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Geracao</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Consumo</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Pico</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Temp Media</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Horas de Sol</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Eficiencia</th>
                </tr>
              </thead>
              <tbody>
                {historicalData.map((day, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{day.fullDate}</td>
                    <td className="px-4 py-3 text-right text-sm">
                      <span className="font-medium text-primary">{day.totalGeracao} kWh</span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-foreground">{day.totalConsumo} kWh</td>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">{day.horarioPico}</td>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">{day.temperaturaMedia}C</td>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">{day.horasSol}h</td>
                    <td className="px-4 py-3 text-right text-sm">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        day.eficiencia >= 80 
                          ? 'bg-green-500/10 text-green-500' 
                          : day.eficiencia >= 60 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {day.eficiencia}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Sun className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Melhor Dia</p>
                <p className="text-lg font-bold text-foreground">{peakDay.fullDate}</p>
                <p className="text-sm text-primary">{peakDay.totalGeracao} kWh gerados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Thermometer className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Temperatura Media</p>
                <p className="text-lg font-bold text-foreground">{avgTemperatura.toFixed(1)}C</p>
                <p className="text-sm text-muted-foreground">Nos ultimos 7 dias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo Energetico</p>
                <p className={`text-lg font-bold ${
                  totalGeracao > totalConsumo ? 'text-green-500' : 'text-destructive'
                }`}>
                  {totalGeracao > totalConsumo ? '+' : ''}{(totalGeracao - totalConsumo).toFixed(1)} kWh
                </p>
                <p className="text-sm text-muted-foreground">
                  {totalGeracao > totalConsumo ? 'Excedente' : 'Deficit'} semanal
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
