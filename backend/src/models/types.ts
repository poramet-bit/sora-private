export type Gender = 'male' | 'female' | 'other'
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical'

export interface User {
  id: string
  name: string
  email: string
  password?: string
  age: number
  gender: Gender
  createdAt: string
}

export interface HealthRecord {
  id: string
  userId: string
  imageUrl: string | null
  age: number
  gender: Gender
  weight: number
  height: number
  bloodPressureSystolic: number | null
  bloodPressureDiastolic: number | null
  heartRate: number | null
  bodyTemperature: number | null
  symptoms: string
  medicalHistory: string
  createdAt: string
}

export interface AnalysisResult {
  id: string
  healthRecordId: string
  userId: string
  riskLevel: RiskLevel
  riskScore: number
  bmi: number
  recommendations: string
  factors: string
  createdAt: string
}

export interface HistoryItem {
  id: string
  userId: string
  healthRecordId: string
  analysisResultId: string
  riskLevel: RiskLevel
  riskScore: number
  date: string
}

// DTOs
export interface CreateUserDTO {
  name: string
  email: string
  password: string
  age: number
  gender: Gender
}

export interface LoginDTO {
  email: string
  password: string
}

export interface CreateHealthRecordDTO {
  userId: string
  imageUrl?: string
  age: number
  gender: Gender
  weight: number
  height: number
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  heartRate?: number
  bodyTemperature?: number
  symptoms: string
  medicalHistory?: string
}