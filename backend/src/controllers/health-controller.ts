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

    // Store as base64 data URL (in production, use R2 or Cloudflare Images)
    const arrayBuffer = await file.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    const dataUrl = `data:${file.type};base64,${base64}`

    return c.json({ data: { imageUrl: dataUrl, filename: file.name, size: file.size } })
  }

  async analyze(c: Context<{ Bindings: Env }>) {
    const body = await c.req.json<CreateHealthRecordDTO>()

    // Validate required fields
    if (!body.userId || !body.symptoms) return c.json({ error: 'userId and symptoms are required' }, 400)

    // Save health record
    const record = await this.repo.createRecord(body)

    // Calculate BMI
    const heightM = body.height / 100
    const bmi = body.weight / (heightM * heightM)

    // Try AI analysis first, fall back to rule-based
    let result: {
      riskLevel: any
      riskScore: number
      bmi: number
      recommendations: string[]
      factors: string[]
      aiSummary?: string
    }

    const aiResult = await this.aiService.analyzeWithAI(c.env.AI, body, Math.round(bmi * 10) / 10)

    if (aiResult) {
      result = {
        riskLevel: aiResult.riskLevel,
        riskScore: aiResult.riskScore,
        bmi: Math.round(bmi * 10) / 10,
        recommendations: aiResult.recommendations,
        factors: aiResult.factors,
        aiSummary: aiResult.aiSummary,
      }
    } else {
      // Fallback to rule-based
      const ruleResult = this.ruleBased.analyze(body)
      result = {
        riskLevel: ruleResult.riskLevel,
        riskScore: ruleResult.riskScore,
        bmi: ruleResult.bmi,
        recommendations: ruleResult.recommendations,
        factors: ruleResult.factors,
      }
    }

    // Save analysis result
    const analysisResult = await this.repo.createAnalysis({
      id: crypto.randomUUID(),
      healthRecordId: record.id,
      userId: body.userId,
      riskLevel: result.riskLevel,
      riskScore: result.riskScore,
      bmi: result.bmi,
      recommendations: result.recommendations.join('\n'),
      factors: result.factors.join('\n'),
    })

    const response: any = {
      record,
      analysis: analysisResult,
      factors: result.factors,
      recommendations: result.recommendations,
    }

    if (result.aiSummary) {
      response.aiSummary = result.aiSummary
    }

    return c.json({ data: response }, 201)
  }

  async getHistory(c: Context<{ Bindings: Env }>) {
    const userId = c.req.query("userId") || ""
    if (userId) {
      const history = await this.repo.findHistoryByUser(userId)
      return c.json({ data: history })
    }
    const history = await this.repo.findAllHistory()
    return c.json({ data: history })
  }

  async getAnalysis(c: Context<{ Bindings: Env }>) {
    const id = c.req.param('id')!
    const result = await this.repo.findAnalysisById(id)
    if (!result) return c.json({ error: 'Analysis not found' }, 404)
    const record = await this.repo.findRecordById(result.healthRecordId)
    return c.json({ data: { analysis: result, record } })
  }
}