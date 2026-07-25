import { useState } from 'react'
import { api, type UserProfile } from '../services/api'

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [form, setForm] = useState({ name: '', email: '', age: 30, gender: 'male' })
  const [loginEmail, setLoginEmail] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Check if already logged in on mount
  useState(() => {
    const savedId = localStorage.getItem('userId')
    if (savedId) {
      api.getProfile(savedId).then(res => setProfile(res.data)).catch(() => {})
    }
  })

  const create = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('⚠️ กรุณากรอกชื่อและอีเมล')
      return
    }
    setLoading(true); setError(null); setSuccess(null)
    try {
      const res = await api.createProfile(form)
      setProfile(res.data)
      localStorage.setItem('userId', res.data.id)
      setSuccess('✅ สร้างโปรไฟล์สำเร็จ!')
    } catch (e: any) { setError('❌ ' + e.message) }
    finally { setLoading(false) }
  }

  const loginByEmail = async () => {
    if (!loginEmail.trim()) {
      setError('⚠️ กรุณากรอกอีเมล')
      return
    }
    setLoading(true); setError(null)
    try {
      const res = await api.loginByEmail(loginEmail)
      setProfile(res.data)
      localStorage.setItem('userId', res.data.id)
      setSuccess('✅ เข้าสู่ระบบสำเร็จ!')
    } catch (e: any) { setError('❌ ' + e.message) }
    finally { setLoading(false) }
  }

  const logout = () => {
    localStorage.removeItem('userId')
    setProfile(null)
    setForm({ name: '', email: '', age: 30, gender: 'male' })
    setSuccess(null)
  }

  if (profile) {
    return (
      <div>
        <div className="page-header"><h1>👤 โปรไฟล์ของฉัน</h1></div>
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <p><strong>📧 อีเมล:</strong> {profile.email}</p>
            <p><strong>👤 ชื่อ:</strong> {profile.name}</p>
            <p><strong>🎂 อายุ:</strong> {profile.age} ปี</p>
            <p><strong>⚧ เพศ:</strong> {profile.gender === 'male' ? 'ชาย' : profile.gender === 'female' ? 'หญิง' : 'อื่นๆ'}</p>
          </div>
          <button className="btn btn-outline" onClick={logout} style={{ marginTop: '1rem' }}>ออกจากระบบ</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>👤 {showLogin ? 'เข้าสู่ระบบ' : 'สร้างโปรไฟล์'}</h1>
        <p>{showLogin ? 'กรอกอีเมลเพื่อเข้าสู่ระบบ' : 'สร้างโปรไฟล์ก่อนเริ่มประเมินความเสี่ยง'}</p>
      </div>
      <div className="card">
        {showLogin ? (
          <>
            <div className="form-group">
              <label>อีเมล *</label>
              <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="เช่น somchai@email.com" />
            </div>
            {error && <p style={{ color: 'var(--danger)', marginBottom: '0.75rem' }}>{error}</p>}
            {success && <p style={{ color: 'var(--success)', marginBottom: '0.75rem' }}>{success}</p>}
            <button className="btn btn-primary" onClick={loginByEmail} disabled={loading} style={{ width: '100%' }}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
            <button className="btn btn-outline" onClick={() => { setShowLogin(false); setError(null) }} style={{ width: '100%', marginTop: '0.5rem' }}>
              ยังไม่มีบัญชี? สมัครใหม่
            </button>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>ชื่อ-นามสกุล *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="เช่น สมชาย ใจดี" />
            </div>
            <div className="form-group">
              <label>อีเมล *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="เช่น somchai@email.com" />
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
            <button className="btn btn-outline" onClick={() => { setShowLogin(true); setError(null) }} style={{ width: '100%', marginTop: '0.5rem' }}>
              มีบัญชีแล้ว? เข้าสู่ระบบ
            </button>
          </>
        )}
      </div>
    </div>
  )
}