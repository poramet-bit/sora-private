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
            content: 'คุณเป็นผู้ช่วยวิเคราะห์สุขภาพ AI จงตอบเป็นภาษาไทยเท่านั้น วิเคราะห์ข้อมูลสุขภาพและให้คำแนะนำเชิงลึก'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
      }) as any

      const text = response?.response || response?.result?.response || ''
      if (!text) return null

      return this.parseAIResponse(text, bmi)
    } catch (err) {
      console.error('AI analysis failed:', err)
      return null
    }
  }

  private buildPrompt(data: CreateHealthRecordDTO, bmi: number): string {
    return `วิเคราะห์ความเสี่ยงสุขภาพจากข้อมูลต่อไปนี้:

- อายุ: ${data.age} ปี
- เพศ: ${data.gender}
- น้ำหนัก: ${data.weight} กก.
- ส่วนสูง: ${data.height} ซม.
- BMI: ${bmi.toFixed(1)}
- ความดันโลหิต: ${data.bloodPressureSystolic}/${data.bloodPressureDiastolic} mmHg
- อัตราการเต้นหัวใจ: ${data.heartRate} bpm
- อุณหภูมิร่างกาย: ${data.bodyTemperature} °C
- อาการ: ${data.symptoms}
- ประวัติการแพทย์: ${data.medicalHistory || 'ไม่มี'}

จงตอบในรูปแบบ JSON เท่านั้น ดังนี้:
{
  "riskLevel": "low | moderate | high | critical",
  "riskScore": 0-100,
  "summary": "สรุปผลการวิเคราะห์เป็นภาษาไทย 2-3 ประโยค",
  "factors": ["ปัจจัยเสี่ยง 1", "ปัจจัยเสี่ยง 2"],
  "recommendations": ["คำแนะนำ 1", "คำแนะนำ 2", "คำแนะนำ 3"]
}`
  }

  private parseAIResponse(text: string, bmi: number): {
    riskLevel: RiskLevel
    riskScore: number
    recommendations: string[]
    factors: string[]
    aiSummary: string
  } {
    // Extract JSON from AI response (it may have markdown code fences)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    let parsed: any = null

    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0])
      } catch {
        // If JSON parse fails, use text as summary
      }
    }

    if (parsed) {
      const validLevels: RiskLevel[] = ['low', 'moderate', 'high', 'critical']
      const riskLevel = validLevels.includes(parsed.riskLevel) ? parsed.riskLevel : 'moderate'
      const riskScore = Math.min(100, Math.max(0, Number(parsed.riskScore) || 50))
      const recommendations = Array.isArray(parsed.recommendations)
        ? parsed.recommendations.filter((r: any) => typeof r === 'string').slice(0, 6)
        : ['ควรตรวจสุขภาพประจำปี']
      const factors = Array.isArray(parsed.factors)
        ? parsed.factors.filter((f: any) => typeof f === 'string').slice(0, 6)
        : [`BMI ${bmi.toFixed(1)}`]
      const aiSummary = typeof parsed.summary === 'string' ? parsed.summary : text.slice(0, 200)

      return { riskLevel, riskScore, recommendations, factors, aiSummary }
    }

    // Fallback: use text as summary
    return {
      riskLevel: 'moderate',
      riskScore: 50,
      recommendations: ['ควรตรวจสุขภาพประจำปี'],
      factors: [`BMI ${bmi.toFixed(1)}`],
      aiSummary: text.slice(0, 300),
    }
  }
}