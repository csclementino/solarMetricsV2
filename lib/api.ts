const API_BASE_URL = 'https://solarmetrics-api.grouparc.com.br'

export interface Sistema {
  id: string
  nomeInstalacao: string
  dataInstalacao: string
  potenciaTotal: number
  status: 'ATIVO' | 'INATIVO'
  clienteId?: string
}

export interface Sensor {
  id: string
  status: string
  tipo: string
  localizacao: string
}

export interface Painel {
  modelo: string
  fabricante: string
  potenciaMaxima: number
}

export interface CreateSistemaData {
  nomeInstalacao: string
  dataInstalacao: string
  potenciaTotal: number
  status: 'ATIVO' | 'INATIVO'
  clienteId: string
}

async function fetchWithAuth(url: string, token: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export const api = {
  getSistemasByCliente: (clienteId: string, token: string): Promise<Sistema[]> => {
    return fetchWithAuth(`/sistema/cliente/${clienteId}`, token)
  },

  getSistema: (sistemaId: string, token: string): Promise<Sistema> => {
    return fetchWithAuth(`/sistema/${sistemaId}`, token)
  },

  createSistema: (data: CreateSistemaData, token: string): Promise<void> => {
    return fetchWithAuth('/sistema', token, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  deleteSistema: (sistemaId: string, token: string): Promise<void> => {
    return fetchWithAuth(`/sistema/${sistemaId}`, token, {
      method: 'DELETE',
    })
  },

  getSensoresBySistema: (sistemaId: string, token: string): Promise<Sensor> => {
    return fetchWithAuth(`/sensor/sistema/${sistemaId}`, token)
  },

  getPaineisBySistema: (sistemaId: string, token: string): Promise<Painel[]> => {
    return fetchWithAuth(`/painelsolar/sistema/${sistemaId}`, token)
  },
}
