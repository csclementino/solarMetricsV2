"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface User {
  id: string
  nome: string
  email: string
  sensorId?: string
  roles: string[]
}

interface AuthContextType {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

interface RegisterData {
  email: string
  nome: string
  telefone: string
  tipoUser: string
  senha: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function parseJwt(token: string): { sub: string; nome: string; id: string; sensorId?: string; roles: string[]; exp: number } {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
  return JSON.parse(jsonPayload)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('solarmetrics_token')
    if (storedToken) {
      try {
        const payload = parseJwt(storedToken)
        if (payload.exp * 1000 > Date.now()) {
          setAccessToken(storedToken)
          setUser({
            id: payload.id,
            nome: payload.nome,
            email: payload.sub,
            sensorId: payload.sensorId,
            roles: payload.roles
          })
        } else {
          localStorage.removeItem('solarmetrics_token')
        }
      } catch {
        localStorage.removeItem('solarmetrics_token')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const credentials = btoa(`${email}:${password}`)

    const response = await fetch('https://solarmetrics-api.grouparc.com.br:8080/auth', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Credenciais inválidas')
    }

    const data = await response.json()
    const token = data.access_token

    localStorage.setItem('solarmetrics_token', token)
    setAccessToken(token)

    const payload = parseJwt(token)
    setUser({
      id: payload.id,
      nome: payload.nome,
      email: payload.sub,
      sensorId: payload.sensorId,
      roles: payload.roles
    })
  }

  const register = async (data: RegisterData) => {
    const response = await fetch('https://solarmetrics-api.grouparc.com.br:8080/cliente', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Erro ao criar conta')
    }
  }

  const logout = () => {
    localStorage.removeItem('solarmetrics_token')
    setAccessToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      isLoading,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
