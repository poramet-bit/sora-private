import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api, type AnalysisData } from '../services/api'

const healthOptions = [
  'ปวดหัว',
  'เวียนหัว',
  'เหนื่อยง่าย',
  'เจ็บหน้าอก',
  'หายใจไม่ออก',
  'คลื่นไส้',
  'อาเจียน',
  'มีไข้',
  'ไอ',
  'ปวดท้อง',
  'นอนไม่หลับ',
  'เบาหวาน',
  'ความดันโลหิตสูง',
  'โรคหัวใจ',
  'ภูมิแพ้',
  'โรคหอบหืด',
]

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
  const [profileLoading, setProfileLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHealthPicker, setShowHealthPicker] = useState(false)
  const loggedInUserId = localStorage.getItem('userId') || ''
  const [otherText, setOtherText] = useState('')
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [predicting, setPredicting] = useState(false)
  const [predictionDone, setPredictionDone] = useState(false)

  const [form, setForm] = useState({
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    healthItems: [] as string[],
  })

  const set = (key: string, value: string | string[]) => setForm(prev => ({ ...prev, [key]: value }))

  useEffect(() => {
    if (!loggedInUserId) return

    setProfileLoading(true)
    api.getProfile(loggedInUserId)
      .then(res => {
        setForm(prev => ({
          ...prev,
          age: String(res.data.age || ''),
        }))
      })
      .catch(() => {
        localStorage.removeItem('userId')
      })
      .finally(() => setProfileLoading(false))
  }, [loggedInUserId])

  useEffect(() => {
    if (!imageUrl) return

    setPredicting(true)
    setPredictionDone(false)
    api.predictMeasurements(imageUrl)
      .then(res => {
        if (res.data) {
          setForm(prev => ({
            ...prev,
            height: String(res.data.height),
            weight: String(res.data.weight),
          }))
          setPredictionDone(true)
        }
      })
      .catch(err => {
        console.warn('AI measurements prediction failed:', err)
      })
      .finally(() => setPredicting(false))
  }, [imageUrl])

  const toggleHealthItem = (item: string) => {
    setForm(prev => {
      const exists = prev.healthItems.includes(item)
      return {
        ...prev,
        healthItems: exists
          ? prev.healthItems.filter(value => value !== item)
          : [...prev.healthItems, item],
      }
    })
  }

  // Combine preset selections with optional free-text อื่นๆ
  const allSelectedItems = [
    ...form.healthItems,
    ...(showOtherInput && otherText.trim() ? [otherText.trim()] : []),
  ]

  const pickerLabel = allSelectedItems.length ? allSelectedItems.join(', ') : 'ไม่มี'

  const submit = async () => {
    if (!form.age || !form.weight || !form.height) {
      setError('กรุณากรอกอายุ น้ำหนัก และส่วนสูง')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const userId = loggedInUserId || getGuestId()
      const symptomsValue = allSelectedItems.length ? allSelectedItems.join(', ') : 'ไม่มี'
      const data: AnalysisData = {
        userId,
        age: Number(form.age),
        gender: form.gender,
        weight: Number(form.weight),
        height: Number(form.height),
        symptoms: symptomsValue,
        medicalHistory: symptomsValue,
        imageUrl: imageUrl || undefined,
      } as any
      const res = await api.analyze(data)
      navigate('/result/' + res.data.analysis.id)
    } catch (e: any) {
      setError('เกิดข้อผิดพลาด: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>กรอกข้อมูลสุขภาพ</h1>
        <p>กรอกข้อมูลเพื่อให้ AI ประเมินความเสี่ยง</p>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🤖</span>
        <span><strong>AI จะวิเคราะห์ข้อมูลของคุณ</strong> — ใช้ OpenAI gpt-oss-20b ประเมินจาก BMI, อายุ, อาการ และประวัติแพทย์</span>
      </div>

      <div className="card">
        {imageUrl && (
          <div style={{ marginBottom: '1rem' }}>
            <img src={imageUrl} alt="uploaded" style={{ maxWidth: '120px', borderRadius: '8px' }} />
          </div>
        )}

        {predicting && (
          <div style={{ background: '#f3f4f6', color: '#4b5563', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <span>⏳</span>
            <span>AI กำลังประเมินและคาดเดาส่วนสูง/น้ำหนักจากรูปภาพของคุณ...</span>
          </div>
        )}
        {predictionDone && (
          <div style={{ background: '#ecfdf5', color: '#047857', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <span>✅</span>
            <span>AI ได้คาดเดาส่วนสูงและน้ำหนักจากภาพแล้ว (คุณสามารถแก้ไขเพิ่มเติมได้ตามจริง)</span>
          </div>
        )}

        <div className="form-row-3">
          <div className="form-group">
            <label>อายุ (ปี)</label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => set('age', e.target.value)}
              placeholder={profileLoading ? 'กำลังโหลด...' : '0'}
              readOnly={!!loggedInUserId}
            />
            {loggedInUserId && (
              <small style={{ color: 'var(--text-muted)' }}>ใช้อายุจากบัญชีที่ล็อกอิน</small>
            )}
          </div>
          <div className="form-group">
            <label>เพศ</label>
            <select value={form.gender} onChange={(e) => set('gender', e.target.value)}>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>
          <div className="form-group">
            <label>น้ำหนัก (กก.)</label>
            <input type="number" value={form.weight} onChange={(e) => set('weight', e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>ส่วนสูง (ซม.)</label>
            <input type="number" value={form.height} onChange={(e) => set('height', e.target.value)} placeholder="0" />
          </div>
        </div>

        <div className="form-group">
          <label>อาการ / ประวัติการรักษา <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(ถ้ามี)</span></label>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setShowHealthPicker(true)}
            style={{ width: '100%', justifyContent: 'space-between', textAlign: 'left' }}
          >
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pickerLabel}</span>
            <span>▾</span>
          </button>
        </div>

        {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '0.75rem', background: '#fef2f2', borderRadius: '8px' }}>❌ {error}</p>}

        <button className="btn btn-primary" onClick={submit} disabled={loading}
          style={{ width: '100%', fontSize: '1.1rem', padding: '0.85rem' }}>
          {loading ? '🤖 AI กำลังวิเคราะห์...' : '🔍 ให้ AI ประเมินความเสี่ยง'}
        </button>
      </div>

      {showHealthPicker && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowHealthPicker(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(520px, 100%)', maxHeight: '80vh', overflow: 'auto' }}
          >
            <h3 style={{ marginBottom: '0.75rem' }}>เลือกอาการ / ประวัติการรักษา</h3>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => { set('healthItems', []); setShowOtherInput(false); setOtherText('') }}
              style={{ width: '100%', marginBottom: '0.75rem' }}
            >
              ไม่มี
            </button>

            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {healthOptions.map(item => (
                <label
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.65rem 0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: form.healthItems.includes(item) ? '#eff6ff' : 'white',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.healthItems.includes(item)}
                    onChange={() => toggleHealthItem(item)}
                  />
                  <span>{item}</span>
                </label>
              ))}

              {/* อื่นๆ option */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.65rem 0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: showOtherInput ? '#eff6ff' : 'white',
                }}
              >
                <input
                  type="checkbox"
                  checked={showOtherInput}
                  onChange={() => {
                    setShowOtherInput(prev => !prev)
                    if (showOtherInput) setOtherText('')
                  }}
                />
                <span>อื่นๆ</span>
              </label>

              {/* Free-text input shown when อื่นๆ is checked */}
              {showOtherInput && (
                <input
                  type="text"
                  autoFocus
                  value={otherText}
                  onChange={e => setOtherText(e.target.value)}
                  placeholder="ระบุอาการหรือประวัติอื่นๆ..."
                  style={{
                    padding: '0.65rem 0.75rem',
                    border: '1px solid var(--primary, #6366f1)',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                />
              )}
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowHealthPicker(false)}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              ยืนยัน
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
