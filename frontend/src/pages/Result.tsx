import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../services/api'

const riskLabels: Record<string, string> = {
  low: '🟢 ความเสี่ยงต่ำ',
  moderate: '🟡 ความเสี่ยงปานกลาง',
  high: '🔴 ความเสี่ยงสูง',
  critical: '🟣 ความเสี่ยงวิกฤต',
}

const riskDesc: Record<string, string> = {
  low: 'สุขภาพโดยรวมอยู่ในเกณฑ์ดี ควรรักษาสุขภาพต่อไป',
  moderate: 'ควรเฝ้าระวังและปรับพฤติกรรมเพื่อสุขภาพที่ดีขึ้น',
  high: 'ควรพบแพทย์เพื่อตรวจวินิจฉัยเพิ่มเติม',
  critical: 'ควรไปโรงพยาบาลหรือพบแพทย์โดยด่วน',
}

export default function Result() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    api.getAnalysis(id).then(res => setData(res.data)).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤖</div>
      <p>กำลังโหลดผลการวิเคราะห์...</p>
    </div>
  )

  if (error) return (
    <div className="card">
      <p style={{ color: 'var(--danger)' }}>❌ {error}</p>
      <Link to="/analyze" className="btn btn-outline" style={{ marginTop: '1rem' }}>← กลับ</Link>
    </div>
  )
  if (!data) return null

  const { analysis, record } = data
  const riskColor: Record<string, string> = { low: 'var(--success)', moderate: 'var(--warning)', high: 'var(--danger)', critical: 'var(--critical)' }
  const color = riskColor[analysis.riskLevel] || 'var(--text-muted)'
  const recommendations = data.recommendations || analysis.recommendations?.split('\n').filter(Boolean) || []
  const factors = data.factors || analysis.factors?.split('\n').filter(Boolean) || []

  return (
    <div>
      <div className="page-header">
        <h1>📊 ผลการประเมินความเสี่ยง</h1>
        <p>ผลการวิเคราะห์โดย AI (ขั้นตอนที่ 3 จาก 3)</p>
      </div>

      {/* ผลสรุป */}
      <div className="result-box" style={{ background: `${color}15`, border: `2px solid ${color}`, textAlign: 'center' }}>
        <h2 style={{ color, fontSize: '1.8rem', marginBottom: '0.5rem' }}>{riskLabels[analysis.riskLevel]}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{riskDesc[analysis.riskLevel]}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color }}>{analysis.riskScore}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>คะแนนความเสี่ยง</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{analysis.bmi}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ค่า BMI</div>
          </div>
        </div>
      </div>

      {/* ปัจจัยที่พบ */}
      {factors.length > 0 && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>📋 ปัจจัยที่ AI พบ</h3>
          {factors.map((f: string, i: number) => (
            <p key={i} style={{ marginBottom: '0.3rem', padding: '0.4rem', background: 'var(--bg)', borderRadius: '6px' }}>• {f}</p>
          ))}
        </div>
      )}

      {/* คำแนะนำ */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>💡 คำแนะนำจาก AI</h3>
        {recommendations.map((r: string, i: number) => (
          <p key={i} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#f0fdf4', borderRadius: '6px', color: '#166534' }}>
            ✓ {r}
          </p>
        ))}
      </div>

      {/* ข้อมูลที่กรอก */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>📅 ข้อมูลการตรวจ</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
          <div>🗓️ วันที่: {new Date(record.createdAt).toLocaleString('th-TH')}</div>
          <div>🎂 อายุ: {record.age} ปี</div>
          <div>⚖️ น้ำหนัก: {record.weight} กก.</div>
          <div>📏 ส่วนสูง: {record.height} ซม.</div>
          <div>🫀 ความดัน: {record.bloodPressureSystolic}/{record.bloodPressureDiastolic}</div>
          <div>❤️ อัตราหัวใจ: {record.heartRate} ครั้ง/นาที</div>
          <div>🌡️ อุณหภูมิ: {record.bodyTemperature}°C</div>
          <div>🩺 อาการ: {record.symptoms?.substring(0, 40)}</div>
        </div>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Link to="/history" className="btn btn-outline">📋 ดูประวัติทั้งหมด</Link>
        <Link to="/analyze" className="btn btn-outline">🔄 ประเมินใหม่</Link>
        <Link to="/" className="btn btn-primary">🏠 กลับหน้าแรก</Link>
      </div>
    </div>
  )
}
