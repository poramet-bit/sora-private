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
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
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

    // D1 returns snake_case — map to camelCase for frontend
    const analysis: any = {
      id: raw.id,
      healthRecordId: raw.healthRecordId,
      userId: raw.userId,
      riskLevel: raw.riskLevel,
      riskScore: raw.riskScore,
      bmi: raw.bmi,
      recommendations: raw.recommendations,
      factors: raw.factors,
      createdAt: raw.createdAt,
    }

    let record: any = null
    try {
      const rec = await this.repo.findRecordById(raw.healthRecordId)
      if (rec) {
        record = {
          id: rec.id,
          userId: rec.userId,
          age: rec.age,
          gender: rec.gender,
          weight: rec.weight,
          height: rec.height,
          symptoms: rec.symptoms,
          medicalHistory: rec.medicalHistory,
          imageUrl: rec.imageUrl,
          createdAt: rec.createdAt,
        }
      }
    } catch (e) {
      // record lookup may fail
    }

    // Parse factors and recommendations back to arrays
    const factors = raw.factors ? raw.factors.split('\n').filter(Boolean) : []
    const recommendations = raw.recommendations ? raw.recommendations.split('\n').filter(Boolean) : []

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