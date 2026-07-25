import type { CreateHealthRecordDTO, RiskLevel } from '../models/types'

export interface AIAnalysisOutput {
  riskLevel: RiskLevel
  riskScore: number
  bmi: number
  recommendations: string[]
  factors: string[]
  aiSummary: string
}

export class AIService {
  /**
   * Call Cloudflare Workers AI (Llama 3.1) to analyze health data
   */
  async analyzeWithAI(ai: Ai, data: CreateHealthRecordDTO, bmi: number): Promise<{
    riskLevel: RiskLevel
    riskScore: number
    recommendations: string[]
    factors: string[]
    aiSummary: string
  } | null> {
    const prompt = this.buildPrompt(data, bmi)

    try {
      const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          {
            role: 'system',
            content: 'คุณเป็นผู้ช่วยวิเคราะห์สุขภาพ AI จงตอบเป็นภาษาไทย วิเคราะห์ข้อมูลสุขภาพและให้คำแนะนำ'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1200,
      }) as any

      const text: string = response?.response || response?.result?.response || ''
      if (!text || text.length < 10) return null

      return this.parseAIResponse(text, bmi)
    } catch (err) {
      console.error('AI analysis failed:', err)
      return null
    }
  }

  private buildPrompt(data: CreateHealthRecordDTO, bmi: number): string {
    return `วิเคราะห์ความเสี่ยงสุขภาพ:
อายุ: ${data.age} ปี, เพศ: ${data.gender}
น้ำหนัก: ${data.weight}kg, ส่วนสูง: ${data.height}cm, BMI: ${bmi.toFixed(1)}
ความดัน: ${data.bloodPressureSystolic}/${data.bloodPressureDiastolic}
อัตราหัวใจ: ${data.heartRate}bpm, อุณหภูมิ: ${data.bodyTemperature}C
อาการ: ${data.symptoms}
ประวัติแพทย์: ${data.medicalHistory || 'ไม่มี'}

ตอบเป็น JSON:
{"riskLevel":"low|moderate|high|critical","riskScore":0-100,"summary":"สรุปภาษาไทย","factors":["ปัจจัย1"],"recommendations":["คำแนะนำ1"]}`
  }

  private parseAIResponse(text: string, bmi: number): {
    riskLevel: RiskLevel
    riskScore: number
    recommendations: string[]
    factors: string[]
    aiSummary: string
  } {
    // Extract JSON from AI response
    const jsonMatch = text.match(/\{[\s\S]*?\}/)
    let parsed: any = null

    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0])
      } catch {
        // Try to fix common JSON issues
        try {
          const fixed = jsonMatch[0].replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']')
          parsed = JSON.parse(fixed)
        } catch {
          // give up, use text as summary
        }
      }
    }

    if (parsed) {
      const validLevels: RiskLevel[] = ['low', 'moderate', 'high', 'critical']
      const riskLevel = validLevels.includes(parsed.riskLevel) ? parsed.riskLevel : 'moderate'
      const riskScore = Math.min(100, Math.max(0, Number(parsed.riskScore) || 50))
      const recommendations = Array.isArray(parsed.recommendations)
        ? parsed.recommendations.filter((r: any) => typeof r === 'string' && r.length > 0).slice(0, 6)
        : ['ควรตรวจสุขภาพประจำปี']
      const factors = Array.isArray(parsed.factors)
        ? parsed.factors.filter((f: any) => typeof f === 'string' && f.length > 0).slice(0, 6)
        : [`BMI ${bmi.toFixed(1)}`]
      const aiSummary = typeof parsed.summary === 'string' && parsed.summary.length > 0
        ? parsed.summary
        : text.slice(0, 300)

      return { riskLevel, riskScore, recommendations, factors, aiSummary }
    }

    // Fallback: use raw text as summary
    return {
      riskLevel: 'moderate',
      riskScore: 50,
      recommendations: ['ควรตรวจสุขภาพประจำปี'],
      factors: [`BMI ${bmi.toFixed(1)}`],
      aiSummary: text.slice(0, 400),
    }
  }
}