const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || err.message || `HTTP ${res.status}`)
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

export interface UserProfile {
  id: string
  name: string
  email: string
  age: number
  gender: string
  createdAt: string
}

export interface AnalysisData {
  userId: string
  imageUrl?: string
  age: number
  gender: string
  weight: number
  height: number
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  heartRate?: number
  bodyTemperature?: number
  symptoms: string
  medicalHistory?: string
}

export interface AnalysisResult {
  record: { id: string; createdAt: string }
  analysis: {
    id: string
    riskLevel: string
    riskScore: number
    bmi: number
    recommendations: string
    factors: string
    createdAt: string
  }
  factors: string[]
  recommendations: string[]
  aiSummary?: string
}

export const api = {
  getProfile: (userId: string) => request<{ data: UserProfile }>(`/profile/${userId}`),
  createProfile: (data: { name: string; email: string; password: string; age: number; gender: string }) =>
    request<{ data: UserProfile }>('/profile', { method: 'POST', body: JSON.stringify(data) }),
  loginByEmail: (email: string, password: string) =>
    request<{ data: UserProfile }>(`/login`, { method: 'POST', body: JSON.stringify({ email, password }) }),
  updateProfile: (userId: string, data: Partial<{ name: string; email: string; age: number; gender: string }>) =>
    request<{ data: UserProfile }>(`/profile/${userId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  uploadImage: async (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await fetch(`${BASE_URL}/api/upload`, { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Upload failed')
    return res.json()
  },
  analyze: (data: AnalysisData) =>
    request<{ data: AnalysisResult }>('/analyze', { method: 'POST', body: JSON.stringify(data) }),
  getHistory: (userId: string) =>
    request<{ data: any[] }>(`/history?userId=${userId}`),
  getAnalysis: (id: string) =>
    request<{ data: AnalysisResult }>(`/analysis/${id}`),
}