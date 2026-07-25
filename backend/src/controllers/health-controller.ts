import type { Context } from 'hono'
import type { Env } from '../index'
import { HealthRepository } from '../repositories/health-repository'
import { AnalysisService } from '../services/analysis-service'
import type { CreateHealthRecordDTO } from '../models/types'

export class HealthController {
  private repo: HealthRepository
  private analysis = new AnalysisService()

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

    // Run analysis
    const result = this.analysis.analyze(body)

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

    return c.json({ data: { record, analysis: analysisResult, factors: result.factors, recommendations: result.recommendations } }, 201)
  }

  async getHistory(c: Context<{ Bindings: Env }>) {
    const userId = c.req.query('userId')
    if (userId) {
      const history = await this.repo.findHistoryByUser(userId)
      return c.json({ data: history })
    }
    const history = await this.repo.findAllHistory()
    return c.json({ data: history })
  }

  async getAnalysis(c: Context<{ Bindings: Env }>) {
    const id = c.req.param('id')
    const result = await this.repo.findAnalysisById(id)
    if (!result) return c.json({ error: 'Analysis not found' }, 404)
    const record = await this.repo.findRecordById(result.healthRecordId)
    return c.json({ data: { analysis: result, record } })
  }
}
