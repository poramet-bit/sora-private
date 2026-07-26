import type { CreateHealthRecordDTO, RiskLevel } from '../models/types'
import { dataURItoUint8Array } from '../utils/image'

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
   * Helper to run Workers AI models with automatic license agreement retry (one-time requirement for Llama 3.2 models)
   */
  private async runWithAgreement(ai: Ai, model: string, payload: any): Promise<any> {
    try {
      return await ai.run(model as any, payload)
    } catch (err: any) {
      const errMsg = String(err.message || err)
      if (errMsg.includes('5016') || errMsg.includes('agree')) {
        console.log(`[AI-Service] Automatically submitting 'agree' prompt for licensing of ${model}...`)
        try {
          await ai.run(model as any, { prompt: 'agree' })
          console.log(`[AI-Service] License agreement submitted. Retrying original model call...`)
          return await ai.run(model as any, payload)
        } catch (agreeErr: any) {
          const agreeMsg = String(agreeErr.message || agreeErr)
          if (agreeMsg.includes('Thank you for agreeing') || agreeMsg.includes('You may now use the model')) {
            console.log(`[AI-Service] License agreement confirmed. Retrying original model call...`)
            return await ai.run(model as any, payload)
          } else {
            console.error('[AI-Service] Failed to auto-agree to license:', agreeErr)
          }
        }
      }
      throw err
    }
  }

  /**
   * Call Cloudflare Workers AI to analyze health data (supporting visual analysis if image is provided)
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
      let response: any = null
      const imageBytes = data.imageUrl ? dataURItoUint8Array(data.imageUrl) : null

      if (imageBytes) {
        console.log(`[AI-Service] Image detected! Size: ${imageBytes.length} bytes. Running vision model: @cf/meta/llama-3.2-11b-vision-instruct`);
        // Use vision model when image is available
        response = await this.runWithAgreement(ai, '@cf/meta/llama-3.2-11b-vision-instruct', {
          prompt: `${prompt}\nโปรดพิจารณารูปภาพที่แนบมาประกอบการวิเคราะห์สุขภาพและระบุในปัจจัยเสี่ยง/คำแนะนำด้วยหากพบสิ่งผิดปกติจากภาพ`,
          image: Array.from(imageBytes),
          max_tokens: 1200,
        })
      } else {
        console.log(`[AI-Service] No image provided or failed to parse. Running text model: @cf/meta/llama-3.1-8b-instruct`);
        // Fallback to text model when no image is present
        response = await this.runWithAgreement(ai, '@cf/meta/llama-3.1-8b-instruct', {
          messages: [
            {
              role: 'system',
              content: 'คุณเป็นผู้ช่วยวิเคราะห์สุขภาพ AI จงตอบเป็นภาษาไทย วิเคราะห์ข้อมูลสุขภาพและให้คำแนะนำ'
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1200,
        })
      }

      const text: string = response?.response || response?.result?.response || response?.choices?.[0]?.message?.content || ''
      if (!text || text.length < 10) return null

      return this.parseAIResponse(text, bmi)
    } catch (err) {
      console.error('AI analysis failed:', err)
      return null
    }
  }

  private buildPrompt(data: CreateHealthRecordDTO, bmi: number): string {
    const bpStr = data.bloodPressureSystolic && data.bloodPressureDiastolic
      ? `ความดัน: ${data.bloodPressureSystolic}/${data.bloodPressureDiastolic} mmHg\n` : ''
    const hrStr = data.heartRate ? `อัตราหัวใจ: ${data.heartRate} bpm\n` : ''
    const tempStr = data.bodyTemperature ? `อุณหภูมิ: ${data.bodyTemperature}°C\n` : ''
    return `วิเคราะห์ความเสี่ยงสุขภาพ:
อายุ: ${data.age} ปี, เพศ: ${data.gender}
น้ำหนัก: ${data.weight}kg, ส่วนสูง: ${data.height}cm, BMI: ${bmi.toFixed(1)}
${bpStr}${hrStr}${tempStr}อาการ: ${data.symptoms}
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

  /**
   * Predict height and weight from an uploaded image using vision AI
   */
  async predictMeasurements(ai: Ai, imageUrl: string): Promise<{ height: number; weight: number } | null> {
    const imageBytes = dataURItoUint8Array(imageUrl)
    if (!imageBytes) return null

    try {
      console.log(`[AI-Service] Predicting measurements from image... Size: ${imageBytes.length} bytes`)
      const response = await this.runWithAgreement(ai, '@cf/meta/llama-3.2-11b-vision-instruct', {
        prompt: `Analyze the person in this image and estimate their height in centimeters and weight in kilograms. Respond ONLY with a valid JSON object matching this schema: {"height": number, "weight": number}. Do not write any other explanation or markdown code blocks.`,
        image: Array.from(imageBytes),
        max_tokens: 150,
      }) as any

      console.log(`[AI-Service] Raw response from vision model:`, response)
      const textRaw = response?.response || response?.result?.response || response?.choices?.[0]?.message?.content || ''
      const text = typeof textRaw === 'string' ? textRaw : JSON.stringify(textRaw) || ''

      if (!text || text.length < 2) {
        console.warn(`[AI-Service] Empty text returned from model`)
        return null
      }

      // Extract JSON from AI response
      const jsonMatch = text.match(/\{[\s\S]*?\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        const height = Math.round(Number(parsed.height))
        const weight = Math.round(Number(parsed.weight))
        if (!isNaN(height) && !isNaN(weight) && height > 0 && weight > 0) {
          console.log(`[AI-Service] Prediction success! Height: ${height}cm, Weight: ${weight}kg`)
          return { height, weight }
        }
      }
      return null
    } catch (err) {
      console.error('AI measurements prediction failed:', err)
      return null
    }
  }
}