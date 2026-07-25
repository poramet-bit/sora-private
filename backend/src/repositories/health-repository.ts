import type { HealthRecord, CreateHealthRecordDTO, AnalysisResult, HistoryItem } from '../models/types'

export class HealthRepository {
  constructor(private db: D1Database) {}

  async createRecord(data: CreateHealthRecordDTO): Promise<HealthRecord> {
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    await this.db.prepare(`INSERT INTO health_records (id, user_id, image_url, age, gender, weight, height, bp_systolic, bp_diastolic, heart_rate, body_temp, symptoms, medical_history, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(id, data.userId, data.imageUrl ?? null, data.age, data.gender, data.weight, data.height, data.bloodPressureSystolic, data.bloodPressureDiastolic, data.heartRate, data.bodyTemperature, data.symptoms, data.medicalHistory ?? '', createdAt).run()
    return { id, ...data, imageUrl: data.imageUrl ?? null, medicalHistory: data.medicalHistory ?? '', createdAt }
  }

  async findRecordById(id: string): Promise<HealthRecord | null> {
    return await this.db.prepare('SELECT * FROM health_records WHERE id = ?').bind(id).first() as unknown as HealthRecord | null
  }

  async findRecordsByUser(userId: string): Promise<HealthRecord[]> {
    const { results } = await this.db.prepare('SELECT * FROM health_records WHERE user_id = ? ORDER BY created_at DESC').bind(userId).all()
    return results as unknown as HealthRecord[]
  }

  async createAnalysis(data: Omit<AnalysisResult, 'createdAt'>): Promise<AnalysisResult> {
    const createdAt = new Date().toISOString()
    await this.db.prepare(`INSERT INTO analysis_results (id, health_record_id, user_id, risk_level, risk_score, bmi, recommendations, factors, created_at) VALUES (?,?,?,?,?,?,?,?,?)`)
      .bind(data.id, data.healthRecordId, data.userId, data.riskLevel, data.riskScore, data.bmi, data.recommendations, data.factors, createdAt).run()
    return { ...data, createdAt }
  }

  async findAnalysisByRecord(recordId: string): Promise<AnalysisResult | null> {
    return await this.db.prepare('SELECT * FROM analysis_results WHERE health_record_id = ?').bind(recordId).first() as unknown as AnalysisResult | null
  }

  async findAnalysisByUser(userId: string): Promise<AnalysisResult[]> {
    const { results } = await this.db.prepare('SELECT * FROM analysis_results WHERE user_id = ? ORDER BY created_at DESC').bind(userId).all()
    return results as unknown as AnalysisResult[]
  }

  async findAnalysisById(id: string): Promise<AnalysisResult | null> {
    return await this.db.prepare('SELECT * FROM analysis_results WHERE id = ?').bind(id).first() as unknown as AnalysisResult | null
  }

  async findHistoryByUser(userId: string): Promise<HistoryItem[]> {
    const { results } = await this.db.prepare(`SELECT ar.id, ar.user_id, ar.health_record_id, ar.id as analysis_result_id, ar.risk_level, ar.risk_score, ar.created_at as date FROM analysis_results ar WHERE ar.user_id = ? ORDER BY ar.created_at DESC`).bind(userId).all()
    return results as unknown as HistoryItem[]
  }

  async findAllHistory(): Promise<HistoryItem[]> {
    const { results } = await this.db.prepare(`SELECT ar.id, ar.user_id, ar.health_record_id, ar.id as analysis_result_id, ar.risk_level, ar.risk_score, ar.created_at as date FROM analysis_results ar ORDER BY ar.created_at DESC`).all()
    return results as unknown as HistoryItem[]
  }
}
