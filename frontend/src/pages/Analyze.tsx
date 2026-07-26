import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { api, type AnalysisData } from '../services/api'

// Generate a guest ID for anonymous users
function getGuestId(): string {
  let id = localStorage.getItem('guestId')
  if (!id) {
    id = 'guest-' + crypto.randomUUID()
    localStorage.setItem('guestId', id)
  }
  return id
}

export default function Analyze() {
  const location = useLocation()
  const navigate = useNavigate()
  const imageUrl = (location.state as any)?.imageUrl || null
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    age: 30,
    gender: 'male',
    weight: 70,
    height: 170,
    symptoms: '',
    medicalHistory: '',
  })

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

  const submit = async () => {
    if (!form.symptoms.trim()) {
      setError('⚠️ กรุณาอธิบายอาการอย่างน้อย 1 อาการ')
      return
    }
    setLoading(true)
    setError(null)
    try {
      // Use real userId if logged in, otherwise use guest ID
      const userId = localStorage.getItem('userId') || getGuestId()
      const data: AnalysisData = {
        ...form,
        userId,
        imageUrl: imageUrl || undefined,
      } as any
      const res = await api.analyze(data)
      navigate(`/result/${res.data.analysis.id}`)
    } catch (e: any) {
      setError('❌ เกิดข้อผิดพลาด: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const numInput = (label: string, key: keyof typeof form) => (
    <div className="form-group">
      <label>{label}</label>
      <input type="number" value={form[key] as number} onChange={(e) => set(key, Number(e.target.value))} />
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <h1>📝 กรอกข้อมูลสุขภาพ</h1>
        <p>กรอกข้อมูลเพื่อให้ AI ประเมินความเสี่ยง (ขั้นตอนที่ 2 จาก 3)</p>
      </div>

      {/* AI Badge */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🤖</span>
        <span><strong>AI จะวิเคราะห์ข้อมูลของคุณ</strong> — คำนวณจาก BMI, อายุ, อาการ และประวัติแพทย์</span>
      </div>

      <div className="card">
        {imageUrl && (
          <div style={{ marginBottom: '1rem' }}>
            <img src={imageUrl} alt="รูปที่อัปโหลด" style={{ maxWidth: '120px', borderRadius: '8px' }} />
          </div>
        )}

        <div className="form-row-3">
          {numInput('อายุ (ปี)', 'age')}
          <div className="form-group">
            <label>เพศ</label>
            <select value={form.gender} onChange={(e) => set('gender', e.target.value)}>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>
          {numInput('น้ำหนัก (กก.)', 'weight')}
        </div>

        <div className="form-row">
          {numInput('ส่วนสูง (ซม.)', 'height')}
        </div>

        <div className="form-group">
          <label>อาการปัจจุบัน * <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(อธิบายอาการที่พบ)</span></label>
          <textarea value={form.symptoms} onChange={(e) => set('symptoms', e.target.value)} rows={3}
            placeholder="เช่น เหนื่อยง่าย, ปวดหัว, เวียนหัว, เจ็บหน้าอก, หายใจไม่ออก..." />
        </div>

        <div className="form-group">
          <label>ประวัติการแพทย์ <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(ถ้ามี)</span></label>
          <textarea value={form.medicalHistory} onChange={(e) => set('medicalHistory', e.target.value)} rows={2}
            placeholder="โรคประจำตัว, ยาที่ทานอยู่..." />
        </div>

        {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '0.75rem', background: '#fef2f2', borderRadius: '8px' }}>{error}</p>}

        <button className="btn btn-primary" onClick={submit} disabled={loading}
          style={{ width: '100%', fontSize: '1.1rem', padding: '0.85rem' }}>
          {loading ? (
            <span>🤖 AI กำลังวิเคราะห์...</span>
          ) : (
            <span>🔍 ให้ AI ประเมินความเสี่ยง</span>
          )}
        </button>
      </div>
    </div>
  )
}