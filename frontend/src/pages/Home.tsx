import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useState, useEffect } from 'react'

export default function Home() {
  const [stats, setStats] = useState({ total: 0, critical: 0 })

  useEffect(() => {
    api.getHistory().then(res => {
      const items = res.data || []
      setStats({
        total: items.length,
        critical: items.filter((i: any) => i.riskLevel === 'critical' || i.riskLevel === 'high').length,
      })
    }).catch(() => {})
  }, [])

  return (
    <div>
      <div className="page-header" style={{ textAlign: 'center', padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem' }}>🏥 AI ประเมินความเสี่ยงด้านสุขภาพ</h1>
        <p style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>ประเมินความเสี่ยงเบื้องต้นจากรูปภาพและข้อมูลสุขภาพของคุณด้วย AI</p>
      </div>

      {/* ปุ่ม 3 ขั้นตอน */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/upload" className="card" style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit', cursor: 'pointer', transition: 'transform 0.15s' }}>
          <div style={{ fontSize: '3rem' }}>📷</div>
          <h3 style={{ margin: '0.75rem 0 0.35rem' }}>1. อัปโหลดรูป</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>ถ่ายหรือเลือกรูปภาพ</p>
        </Link>

        <Link to="/analyze" className="card" style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
          <div style={{ fontSize: '3rem' }}>📝</div>
          <h3 style={{ margin: '0.75rem 0 0.35rem' }}>2. กรอกข้อมูล</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>ใส่ข้อมูลสุขภาพ</p>
        </Link>

        <Link to="/analyze" className="card" style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
          <div style={{ fontSize: '3rem' }}>📊</div>
          <h3 style={{ margin: '0.75rem 0 0.35rem' }}>3. ดูผลลัพธ์</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>รับคำแนะนำทันที</p>
        </Link>
      </div>

      {/* ปุ่มเริ่มใหญ่ */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Link to="/upload" className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '0.85rem 3rem' }}>
          🔍 เริ่มประเมินตอนนี้ →
        </Link>
      </div>

      {/* สถิติ */}
      {stats.total > 0 && (
        <div className="stats-grid">
          <div className="stat-card card">
            <div className="num" style={{ color: 'var(--primary)' }}>{stats.total}</div>
            <div className="label">การประเมินทั้งหมด</div>
          </div>
          <div className="stat-card card">
            <div className="num" style={{ color: 'var(--success)' }}>{stats.total - stats.critical}</div>
            <div className="label">ความเสี่ยงต่ำ-ปานกลาง</div>
          </div>
          <div className="stat-card card">
            <div className="num" style={{ color: 'var(--danger)' }}>{stats.critical}</div>
            <div className="label">ความเสี่ยงสูง-วิกฤต</div>
          </div>
          <div className="stat-card card">
            <Link to="/history" style={{ textDecoration: 'none', color: 'var(--primary)' }}>
              <div className="num">📋</div>
              <div className="label">ดูประวัติทั้งหมด</div>
            </Link>
          </div>
        </div>
      )}

      {/* คำอธิบาย AI */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>🤖 ระบบ AI ประเมินความเสี่ยง</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          ระบบของเราวิเคราะห์ความเสี่ยงด้านสุขภาพจากข้อมูลที่คุณกรอก โดยพิจารณาจาก:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          <div style={{ padding: '0.5rem', background: 'var(--bg)', borderRadius: '8px' }}>⚖️ ค่า BMI (น้ำหนัก/ส่วนสูง)</div>
          <div style={{ padding: '0.5rem', background: 'var(--bg)', borderRadius: '8px' }}>🫀 ความดันโลหิต</div>
          <div style={{ padding: '0.5rem', background: 'var(--bg)', borderRadius: '8px' }}>❤️ อัตราการเต้นหัวใจ</div>
          <div style={{ padding: '0.5rem', background: 'var(--bg)', borderRadius: '8px' }}>🌡️ อุณหภูมิร่างกาย</div>
          <div style={{ padding: '0.5rem', background: 'var(--bg)', borderRadius: '8px' }}>🎂 อายุ</div>
          <div style={{ padding: '0.5rem', background: 'var(--bg)', borderRadius: '8px' }}>🩺 อาการที่พบ</div>
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        ⚠️ ผลการประเมินเป็นเพียงการประเมินเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์ ควรปรึกษาแพทย์เสมอ
      </p>
    </div>
  )
}
