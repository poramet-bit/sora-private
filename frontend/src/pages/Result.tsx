import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../services/api'

export default function Result() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    api.getAnalysis(id).then(res => setData(res.data)).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>กำลังโหลดผลลัพธ์...</div>
  if (error) return <div className="card"><p style={{ color: 'var(--danger)' }}>{error}</p><Link to="/analyze" className="btn btn-outline">← กลับ</Link></div>
  if (!data) return null

  const { analysis, record } = data
  const riskClass = `badge badge-${analysis.riskLevel}`
  const riskColor = { low: 'var(--success)', moderate: 'var(--warning)', high: 'var(--danger)', critical: 'var(--critical)' }[analysis.riskLevel as string] || 'var(--text-muted)'
  const recommendations = analysis.recommendations?.split('\n').filter(Boolean) || []

  return (
    <div>
      <div className="page-header">
        <h1>📊 ผลการประเมิน</h1>
      </div>

      <div className="result-box" style={{ background: `${riskColor}15`, border: `2px solid ${riskColor}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: riskColor }}>{analysis.riskLevel.toUpperCase()}</h3>
            <p style={{ color: 'var(--text-muted)' }}>Risk Score: {analysis.riskScore} | BMI: {analysis.bmi}</p>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: riskColor }}>{analysis.riskScore}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>📋 ปัจจัยที่พบ</h3>
        {data.factors?.map((f: string, i: number) => (
          <p key={i} style={{ marginBottom: '0.3rem' }}>• {f}</p>
        )) || <p>{analysis.factors}</p>}
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>💡 คำแนะนำ</h3>
        {(data.recommendations || recommendations).map((r: string, i: number) => (
          <p key={i} style={{ marginBottom: '0.4rem', color: 'var(--text)' }}>✓ {r}</p>
        ))}
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>📅 ข้อมูลการตรวจ</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
          <div>วันที่: {new Date(record.createdAt).toLocaleString('th-TH')}</div>
          <div>อายุ: {record.age} ปี</div>
          <div>น้ำหนัก: {record.weight} kg</div>
          <div>ส่วนสูง: {record.height} cm</div>
          <div>ความดัน: {record.bloodPressureSystolic}/{record.bloodPressureDiastolic}</div>
          <div>อัตราหัวใจ: {record.heartRate} bpm</div>
        </div>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <Link to="/history" className="btn btn-outline">ดูประวัติทั้งหมด</Link>
        <Link to="/" className="btn btn-primary">กลับหน้าแรก</Link>
      </div>
    </div>
  )
}
