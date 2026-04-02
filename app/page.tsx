"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Zap, BarChart3, Leaf, ArrowRight } from 'lucide-react'
import Image from 'next/image'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('login')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [registerData, setRegisterData] = useState({
    nome: '',
    email: '',
    telefone: '',
    tipoUser: '',
    senha: '',
    confirmarSenha: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login, register, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) {
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      await login(loginEmail, loginPassword)
      router.push('/dashboard')
    } catch {
      setError('Email ou senha incorretos.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    if (registerData.senha !== registerData.confirmarSenha) {
      setError('As senhas nao coincidem.')
      setIsLoading(false)
      return
    }

    if (!registerData.tipoUser) {
      setError('Selecione o tipo de usuario.')
      setIsLoading(false)
      return
    }

    try {
      await register({
        nome: registerData.nome,
        email: registerData.email,
        telefone: registerData.telefone,
        tipoUser: registerData.tipoUser,
        senha: registerData.senha
      })
      setSuccess('Conta criada com sucesso!')
      setActiveTab('login')
      setRegisterData({
        nome: '',
        email: '',
        telefone: '',
        tipoUser: '',
        senha: '',
        confirmarSenha: ''
      })
    } catch {
      setError('Erro ao criar conta.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center">
            <Image 
              src="/logo.svg" 
              alt="SolarMetrics" 
              width={140} 
              height={21} 
              priority
            />
          </div>
          <nav className="flex items-center gap-6">
            <a href="#features" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              Recursos
            </a>
            <a href="#auth" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              Entrar
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div className="container mx-auto px-4 pt-14">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Monitoramento inteligente</span>
              </div>
              
              <h1 className="mb-5 text-4xl font-medium tracking-tight text-foreground lg:text-5xl">
                Energia solar,{' '}
                <span className="text-primary">simplificada</span>
              </h1>
              
              <p className="mb-8 text-base text-muted-foreground leading-relaxed">
                Acompanhe a geracao e consumo do seu sistema fotovoltaico em tempo real com uma interface limpa e intuitiva.
              </p>
              
              <Button 
                size="lg"
                className="group gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Comecar agora
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-3 gap-8">
                <div>
                  <p className="text-2xl font-medium text-foreground">98%</p>
                  <p className="text-xs text-muted-foreground mt-1">Precisao</p>
                </div>
                <div>
                  <p className="text-2xl font-medium text-foreground">24/7</p>
                  <p className="text-xs text-muted-foreground mt-1">Monitoramento</p>
                </div>
                <div>
                  <p className="text-2xl font-medium text-foreground">+500</p>
                  <p className="text-xs text-muted-foreground mt-1">Sistemas</p>
                </div>
              </div>
            </div>

            {/* Right Content - Preview Cards */}
            <div className="hidden lg:block">
              <div className="relative">
                <Card className="relative border-border/50 bg-card/80 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-xs text-muted-foreground">Geracao atual</span>
                      <span className="text-xs text-primary">Ao vivo</span>
                    </div>
                    <p className="text-4xl font-medium text-foreground mb-2">4.2 kW</p>
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-1 rounded-full bg-muted">
                        <div className="h-1 w-3/4 rounded-full bg-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground">75%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="absolute -bottom-8 -left-8 w-48 border-border/50 bg-card/80 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                        <Leaf className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">CO2 evitado</p>
                        <p className="text-lg font-medium text-foreground">1.2 ton</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mb-16">
            <h2 className="text-2xl font-medium text-foreground mb-3">
              Recursos
            </h2>
            <p className="text-sm text-muted-foreground">
              Tudo o que voce precisa para monitorar seu sistema solar
            </p>
          </div>
          
          <div className="grid gap-px bg-border/50 md:grid-cols-3 rounded-lg overflow-hidden">
            {[
              { icon: Zap, title: 'Tempo real', desc: 'Dados atualizados a cada segundo' },
              { icon: BarChart3, title: 'Historico', desc: 'Analise o desempenho ao longo do tempo' },
              { icon: Leaf, title: 'Sustentabilidade', desc: 'Acompanhe seu impacto ambiental' },
            ].map((feature, index) => (
              <div key={index} className="bg-background p-8">
                <feature.icon className="h-5 w-5 text-primary mb-4" />
                <h3 className="text-sm font-medium text-foreground mb-2">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth" className="py-24 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-sm">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-medium text-foreground mb-2">
                Acesse sua conta
              </h2>
              <p className="text-sm text-muted-foreground">
                Entre ou crie uma conta para comecar
              </p>
            </div>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login" className="text-xs">Entrar</TabsTrigger>
                    <TabsTrigger value="register" className="text-xs">Criar conta</TabsTrigger>
                  </TabsList>

                  {error && (
                    <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="mb-4 rounded-lg bg-green-500/10 p-3 text-xs text-green-500">
                      {success}
                    </div>
                  )}

                  <TabsContent value="login" className="mt-0">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-xs font-medium text-foreground">
                          Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="h-9 text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="password" className="text-xs font-medium text-foreground">
                          Senha
                        </label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Sua senha"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="h-9 text-sm"
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register" className="mt-0">
                    <form onSubmit={handleRegister} className="space-y-3">
                      <div className="space-y-2">
                        <label htmlFor="nome" className="text-xs font-medium text-foreground">
                          Nome
                        </label>
                        <Input
                          id="nome"
                          type="text"
                          placeholder="Seu nome"
                          value={registerData.nome}
                          onChange={(e) => setRegisterData({ ...registerData, nome: e.target.value })}
                          className="h-9 text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="register-email" className="text-xs font-medium text-foreground">
                          Email
                        </label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          className="h-9 text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="telefone" className="text-xs font-medium text-foreground">
                          Telefone
                        </label>
                        <Input
                          id="telefone"
                          type="tel"
                          placeholder="11999999999"
                          value={registerData.telefone}
                          onChange={(e) => setRegisterData({ ...registerData, telefone: e.target.value })}
                          className="h-9 text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="tipo" className="text-xs font-medium text-foreground">
                          Tipo
                        </label>
                        <Select
                          value={registerData.tipoUser}
                          onValueChange={(value) => setRegisterData({ ...registerData, tipoUser: value })}
                        >
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Residencial">Residencial</SelectItem>
                            <SelectItem value="Comercial">Comercial</SelectItem>
                            <SelectItem value="Industrial">Industrial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="register-password" className="text-xs font-medium text-foreground">
                          Senha
                        </label>
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="Minimo 6 caracteres"
                          value={registerData.senha}
                          onChange={(e) => setRegisterData({ ...registerData, senha: e.target.value })}
                          className="h-9 text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="confirm-password" className="text-xs font-medium text-foreground">
                          Confirmar senha
                        </label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirme sua senha"
                          value={registerData.confirmarSenha}
                          onChange={(e) => setRegisterData({ ...registerData, confirmarSenha: e.target.value })}
                          className="h-9 text-sm"
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Criando...' : 'Criar conta'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image 
                src="/logo.svg" 
                alt="SolarMetrics" 
                width={120} 
                height={18} 
              />
            </div>
            <p className="text-xs text-muted-foreground">
              2024 Todos os direitos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
