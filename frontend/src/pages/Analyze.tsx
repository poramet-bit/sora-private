import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api, type AnalysisData } from '../services/api'

export default function Analyze() {
  const location = useLocation()
  const navigate = useNavigate()
  const imageUrl = (location.state as any)?.imageUrl || null
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    userId: localStorage.getItem('userId') || '',
    age: 30,
    gender: 'male',
    weight: 70,
    height: 170,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    heartRate: 72,
    bodyTemperature: 36.5,
    symptoms: '',
    medicalHistory: '',
  })

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

  const submit = async () => {
    if (!form.userId.trim()) { setError('กรุณากรอก User ID (สร้าง Profile ก่อน)'); return }
    if (!form.symptoms.trim()) { setError('กรุณาอธิบายอาการ'); return }
    setLoading(true)
    setError(null)
    try {
      const data: AnalysisData = { ...form, imageUrl: imageUrl || undefined }
      const res = await api.analyze(data)
      navigate(`/result/${res.data.analysis.id}`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const input = (label: string, key: keyof typeof form, type = 'number') => (
    <div className="form-group">
      <label>{label}</label>
      <input type={type} value={form[key]} onChange={(e) => set(key, type === 'number' ? Number(e.target.value) : e.target.value)} />
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <h1>📝 กรอกข้อมูลสุขภาพ</h1>
        <p>กรอกข้อมูลเพื่อให้ระบบประเมินความเสี่ยง</p>
      </div>

      <div className="card">
        {imageUrl && <img src={imageUrl} alt="Upload" style={{ maxWidth: '150px', borderRadius: '8px', marginBottom: '1rem' }} />}

        <div className="form-group">
          <label>User ID</label>
          <input value={form.userId} onChange={(e) => set('userId', e.target.value)} placeholder="กรอก ID ของคุณ (สร้างจากหน้า Profile)" />
        </div>

        <div className="form-row-3">
          {input('อายุ', 'age')}
          <div className="form-group">
            <label>เพศ</label>
            <select value={form.gender} onChange={(e) => set('gender', e.target.value)}>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>
          {input('น้ำหนัก (kg)', 'weight')}
        </div>

        <div className="form-row">
          {input('ส่วนสูง (cm)', 'height')}
          {input('อัตราการเต้นหัวใจ (bpm)', 'heartRate')}
        </div>

        <div className="form-row-3">
          {input('ความดันบน (Systolic)', 'bloodPressureSystolic')}
          {input('ความดันล่าง (Diastolic)', 'bloodPressureDiastolic')}
          {input('อุณหภูมิร่างกาย (°C)', 'bodyTemperature')}
        </div>

        <div className="form-group">
          <label>อาการปัจจุบัน *</label>
          <textarea value={form.symptoms} onChange={(e) => set('symptoms', e.target.value)} rows={3} placeholder="อธิบายอาการ เช่น เหนื่อยง่าย ปวดหัว..." />
        </div>

        <div className="form-group">
          <label>ประวัติการแพทย์ (ถ้ามี)</label>
          <textarea value={form.medicalHistory} onChange={(e) => set('medicalHistory', e.target.value)} rows={2} placeholder="โรคประจำตัว ยาที่ทาน..." />
        </div>

        {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}

        <button className="btn btn-primary" onClick={submit} disabled={loading} style={{ width: '100%' }}>
          {loading ? 'กำลังวิเคราะห์...' : '🔍 ประเมินความเสี่ยง'}
        </button>
      </div>
    </div>
  )
}
