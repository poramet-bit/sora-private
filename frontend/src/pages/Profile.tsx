import { useState } from 'react'
import { api, type UserProfile } from '../services/api'

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [form, setForm] = useState({ name: '', email: '', age: 30, gender: 'male' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const create = async () => {
    setLoading(true); setError(null); setSuccess(null)
    try {
      const res = await api.createProfile(form)
      setProfile(res.data)
      localStorage.setItem('userId', res.data.id)
      setSuccess('✅ สร้างโปรไฟล์สำเร็จ!')
    } catch (e: any) { setError('❌ ' + e.message) }
    finally { setLoading(false) }
  }

  const lookup = async () => {
    const id = prompt('กรอกรหัสผู้ใช้ (User ID):')
    if (!id) return
    setLoading(true); setError(null)
    try {
      const res = await api.getProfile(id)
      setProfile(res.data)
      localStorage.setItem('userId', res.data.id)
    } catch (e: any) { setError('❌ ' + e.message) }
    finally { setLoading(false) }
  }

  if (profile) {
    return (
      <div>
        <div className="page-header"><h1>👤 โปรไฟล์ของฉัน</h1></div>
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <p><strong>🆔 รหัส:</strong> {profile.id}</p>
            <p><strong>📧 อีเมล:</strong> {profile.email}</p>
            <p><strong>👤 ชื่อ:</strong> {profile.name}</p>
            <p><strong>🎂 อายุ:</strong> {profile.age} ปี</p>
            <p><strong>⚧ เพศ:</strong> {profile.gender === 'male' ? 'ชาย' : profile.gender === 'female' ? 'หญิง' : 'อื่นๆ'}</p>
          </div>
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg)', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              💡 รหัสผู้ใช้นี้ใช้สำหรับประเมิน — จดรหัสนี้ไว้เพื่อดูประวัติ
            </p>
          </div>
          <button className="btn btn-outline" onClick={() => setProfile(null)} style={{ marginTop: '1rem' }}>สร้างโปรไฟล์ใหม่</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>👤 สร้างโปรไฟล์</h1>
        <p>สร้างโปรไฟล์ก่อนเริ่มประเมินความเสี่ยง</p>
      </div>
      <div className="card">
        <div className="form-group">
          <label>ชื่อ-นามสกุล *</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="เช่น สมชาย ใจดี" />
        </div>
        <div className="form-group">
          <label>อีเมล *</label>
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="เช่น somchai@email.com" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>อายุ</label>
            <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} />
          </div>
          <div className="form-group">
            <label>เพศ</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>
        </div>
        {error && <p style={{ color: 'var(--danger)', marginBottom: '0.75rem' }}>{error}</p>}
        {success && <p style={{ color: 'var(--success)', marginBottom: '0.75rem' }}>{success}</p>}
        <button className="btn btn-primary" onClick={create} disabled={loading} style={{ width: '100%' }}>
          {loading ? 'กำลังสร้าง...' : '✅ สร้างโปรไฟล์'}
        </button>
        <button className="btn btn-outline" onClick={lookup} style={{ width: '100%', marginTop: '0.5rem' }}>
          มีรหัสผู้ใช้แล้ว (เข้าสู่ระบบ)
        </button>
      </div>
    </div>
  )
}
