import type { Context } from 'hono'
import type { Env } from '../index'
import { HealthRepository } from '../repositories/health-repository'
import { AnalysisService } from '../services/analysis-service'
import { AIService } from '../services/ai-service'
import type { CreateHealthRecordDTO } from '../models/types'

export class HealthController {
  private repo: HealthRepository
  private ruleBased = new AnalysisService()
  private aiService = new AIService()

  constructor(c: Context<{ Bindings: Env }>) {
    this.repo = new HealthRepository(c.env.DB)
  }

  async upload(c: Context<{ Bindings: Env }>) {
    const body = await c.req.parseBody()
    const file = body['image'] as File | undefined
    if (!file) return c.json({ error: 'No image provided' }, 400)

    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    let binary = ''
    const chunkSize = 0x8000
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
    }
    const base64 = btoa(binary)
    const dataUrl = `data:${file.type};base64,${base64}`

    return c.json({ data: { imageUrl: dataUrl, filename: file.name, size: file.size } })
  }

  async analyze(c: Context<{ Bindings: Env }>) {
    try {
      const body = await c.req.json<CreateHealthRecordDTO>()

      if (!body.userId || !body.symptoms) {
        return c.json({ error: 'userId and symptoms are required' }, 400)
      }

      // Save health record
      const record = await this.repo.createRecord(body)

      // Calculate BMI
      const heightM = body.height / 100
      const bmi = body.weight / (heightM * heightM)
      const bmiRounded = Math.round(bmi * 10) / 10

      // Try AI analysis first, fall back to rule-based
      let riskLevel: string
      let riskScore: number
      let recommendations: string[]
      let factors: string[]
      let aiSummary: string | undefined

      const aiResult = await this.aiService.analyzeWithAI(c.env.AI, body, bmiRounded)

      if (aiResult) {
        riskLevel = aiResult.riskLevel
        riskScore = aiResult.riskScore
        recommendations = aiResult.recommendations
        factors = aiResult.factors
        aiSummary = aiResult.aiSummary
      } else {
        const ruleResult = this.ruleBased.analyze(body)
        riskLevel = ruleResult.riskLevel
        riskScore = ruleResult.riskScore
        recommendations = ruleResult.recommendations
        factors = ruleResult.factors
      }

      // Save analysis result
      const analysisResult = await this.repo.createAnalysis({
        id: crypto.randomUUID(),
        healthRecordId: record.id,
        userId: body.userId,
        riskLevel: riskLevel as any,
        riskScore,
        bmi: bmiRounded,
        recommendations: recommendations.join('\n'),
        factors: factors.join('\n'),
      })

      const response: any = {
        record,
        analysis: analysisResult,
        factors,
        recommendations,
      }

      if (aiSummary) {
        response.aiSummary = aiSummary
      }

      return c.json({ data: response }, 201)
    } catch (err: any) {
      console.error('Analyze error:', err)
      return c.json({ error: 'Analysis failed', message: err.message }, 500)
    }
  }

  async getHistory(c: Context<{ Bindings: Env }>) {
    const userId = c.req.query("userId") || ""
    if (!userId) {
      return c.json({ data: [] })
    }
    const history = await this.repo.findHistoryByUser(userId)
    return c.json({ data: history })
  }

  async getAnalysis(c: Context<{ Bindings: Env }>) {
    const id = c.req.param('id')!
    const raw = await this.repo.findAnalysisById(id)
    if (!raw) return c.json({ error: 'Analysis not found' }, 404)

    // D1 returns snake_case columns — map to camelCase for frontend
    const r: any = raw
    const analysis: any = {
      id: r.id,
      healthRecordId: r.health_record_id || r.healthRecordId,
      userId: r.user_id || r.userId,
      riskLevel: r.risk_level || r.riskLevel,
      riskScore: r.risk_score ?? r.riskScore,
      bmi: r.bmi,
      recommendations: r.recommendations,
      factors: r.factors,
      createdAt: r.created_at || r.createdAt,
    }

    let record: any = null
    try {
      const rec: any = await this.repo.findRecordById(analysis.healthRecordId)
      if (rec) {
        record = {
          id: rec.id,
          userId: rec.user_id || rec.userId,
          age: rec.age,
          gender: rec.gender,
          weight: rec.weight,
          height: rec.height,
          symptoms: rec.symptoms,
          medicalHistory: rec.medical_history || rec.medicalHistory || '',
          imageUrl: rec.image_url || rec.imageUrl,
          createdAt: rec.created_at || rec.createdAt,
        }
      }
    } catch (e) {
      // record lookup may fail
    }

    // Parse factors and recommendations back to arrays
    const factors = analysis.factors ? analysis.factors.split('\n').filter(Boolean) : []
    const recommendations = analysis.recommendations ? analysis.recommendations.split('\n').filter(Boolean) : []

    return c.json({
      data: {
        analysis,
        record,
        factors,
        recommendations,
      }
    })
  }
}
