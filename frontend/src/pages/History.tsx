import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

const riskLabels: Record<string, string> = {
  low: 'ต่ำ', moderate: 'ปานกลาง', high: 'สูง', critical: 'วิกฤต',
}

export default function History() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getHistory().then(res => setItems(res.data || [])).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>กำลังโหลด...</div>

  return (
    <div>
      <div className="page-header">
        <h1>📋 ประวัติการประเมิน</h1>
        <p>ประวัติการประเมินความเสี่ยงทั้งหมด</p>
      </div>

      {error && <div className="card"><p style={{ color: 'var(--danger)' }}>❌ {error}</p></div>}

      {items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>ยังไม่มีประวัติการประเมิน</p>
          <Link to="/upload" className="btn btn-primary">เริ่มประเมิน →</Link>
        </div>
      ) : (
        <div className="card">
          {items.map((item: any) => (
            <Link key={item.id} to={`/result/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="list-item">
                <div>
                  <span className={`badge badge-${item.riskLevel}`}>{riskLabels[item.riskLevel] || item.riskLevel}</span>
                  <span style={{ marginLeft: '0.75rem', fontWeight: 600 }}>คะแนน: {item.riskScore}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {new Date(item.date).toLocaleString('th-TH')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
