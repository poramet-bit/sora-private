import type { CreateHealthRecordDTO, RiskLevel } from '../models/types'

export interface AnalysisOutput {
  riskLevel: RiskLevel
  riskScore: number
  bmi: number
  recommendations: string[]
  factors: string[]
}

export class AnalysisService {
  analyze(data: CreateHealthRecordDTO): AnalysisOutput {
    let score = 0
    const factors: string[] = []
    const recommendations: string[] = []

    // 1. BMI Calculation
    const heightM = data.height / 100
    const bmi = data.weight / (heightM * heightM)

    if (bmi >= 35) { score += 30; factors.push(`BMI ${bmi.toFixed(1)} (อ้วนระดับ 2)`); recommendations.push('BMI สูงมาก ควรปรึกษาแพทย์เพื่อวางแผนลดน้ำหนักอย่างเป็นระบบ') }
    else if (bmi >= 30) { score += 22; factors.push(`BMI ${bmi.toFixed(1)} (อ้วน)`); recommendations.push('อยู่ในเกณฑ์อ้วน ควรควบคุมอาหารและออกกำลังกายสม่ำเสมอ') }
    else if (bmi >= 25) { score += 12; factors.push(`BMI ${bmi.toFixed(1)} (ท้วม)`); recommendations.push('BMI อยู่ในเกณฑ์ท้วม ควรลดอาหารมันและหวาน') }
    else if (bmi < 18.5) { score += 10; factors.push(`BMI ${bmi.toFixed(1)} (น้ำหนักต่ำ)`); recommendations.push('น้ำหนักต่ำกว่าเกณฑ์ ควรได้รับสารอาหารเพิ่มขึ้น') }

    // 2. Age factor
    if (data.age >= 65) { score += 25; factors.push(`อายุ ${data.age} ปี (ผู้สูงอายุ)`); recommendations.push('ผู้สูงอายุ ควรตรวจสุขภาพประจำปีทุก 6 เดือน') }
    else if (data.age >= 50) { score += 15; factors.push(`อายุ ${data.age} ปี`); recommendations.push('ควรตรวจสุขภาพประจำปี') }
    else if (data.age >= 40) { score += 8; factors.push(`อายุ ${data.age} ปี`) }

    // 3. Blood Pressure
    if (data.bloodPressureSystolic >= 180 || data.bloodPressureDiastolic >= 110) {
      score += 35; factors.push(`ความดัน ${data.bloodPressureSystolic}/${data.bloodPressureDiastolic} (สูงระดับ 3)`); recommendations.push('ความดันโลหิตสูงรุนแรง — ไปพบแพทย์โดยด่วน')
    } else if (data.bloodPressureSystolic >= 140 || data.bloodPressureDiastolic >= 90) {
      score += 20; factors.push(`ความดัน ${data.bloodPressureSystolic}/${data.bloodPressureDiastolic} (สูง)`); recommendations.push('ความดันสูง ควรงดเค็มและพบแพทย์')
    } else if (data.bloodPressureSystolic >= 130 || data.bloodPressureDiastolic >= 80) {
      score += 10; factors.push(`ความดัน ${data.bloodPressureSystolic}/${data.bloodPressureDiastolic} (สูงขึ้น)`); recommendations.push('ความดันเริ่มสูง ควรเฝ้าระวัง')
    }

    // 4. Heart Rate
    if (data.heartRate > 120 || data.heartRate < 50) {
      score += 20; factors.push(`อัตราการเต้นหัวใจ ${data.heartRate} bpm`); recommendations.push('อัตราการเต้นหัวใจผิดปกติ ควรพบแพทย์')
    } else if (data.heartRate > 100 || data.heartRate < 60) {
      score += 8; factors.push(`อัตราการเต้นหัวใจ ${data.heartRate} bpm`)
    }

    // 5. Body Temperature
    if (data.bodyTemperature >= 39) {
      score += 25; factors.push(`ไข้ ${data.bodyTemperature}°C`); recommendations.push('ไข้สูง ควรไปพบแพทย์')
    } else if (data.bodyTemperature >= 38) {
      score += 12; factors.push(`ไข้ ${data.bodyTemperature}°C`); recommendations.push('มีไข้ พักผ่อนให้เพียงพอ')
    }

    // 6. Symptoms analysis
    const severeKeywords = ['เจ็บหน้าอก', 'หายใจไม่ออก', 'เป็นลม', 'หมดสติ', 'ชาครึ่งตัว', 'พูดไม่ชัด', 'chest pain', 'shortness of breath']
    const moderateKeywords = ['เหนื่อย', 'ปวดหัว', 'เวียนหัว', 'อ่อนเพลีย', 'ใจสั่น', 'คลื่นไส้', 'อาเจียน']
    const lower = data.symptoms.toLowerCase()
    if (severeKeywords.some(k => lower.includes(k.toLowerCase()))) { score += 40; factors.push('มีอาการรุนแรง'); recommendations.push('มีอาการอันตราย — ไปโรงพยาบาลทันที') }
    if (moderateKeywords.some(k => lower.includes(k.toLowerCase()))) { score += 12; factors.push('มีอาการทั่วไป') }

    // Determine risk level
    let riskLevel: RiskLevel
    if (score >= 70) riskLevel = 'critical'
    else if (score >= 45) riskLevel = 'high'
    else if (score >= 25) riskLevel = 'moderate'
    else riskLevel = 'low'

    if (recommendations.length === 0) recommendations.push('สุขภาพโดยรวมอยู่ในเกณฑ์ดี ควรรักษาสุขภาพด้วยการกินผักผลไม้ ออกกำลังกาย และพักผ่อนให้เพียงพอ')

    return { riskLevel, riskScore: score, bmi: Math.round(bmi * 10) / 10, recommendations, factors }
  }
}
