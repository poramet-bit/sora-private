import { useState } from 'react'
import { api, type UserProfile } from '../services/api'

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [mode, setMode] = useState<'register' | 'login'>('register')
  const [form, setForm] = useState({ name: '', email: '', password: '', age: 30, gender: 'male' })
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Auto-login if userId in localStorage
  useState(() => {
    const savedId = localStorage.getItem('userId')
    if (savedId) {
      api.getProfile(savedId).then(res => setProfile(res.data)).catch(() => {
        localStorage.removeItem('userId')
      })
    }
  })

  const register = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('⚠️ กรุณากรอกชื่อ อีเมล และรหัสผ่าน')
      return
    }
    if (form.password.length < 6) {
      setError('⚠️ รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }
    setLoading(true); setError(null); setSuccess(null)
    try {
      const res = await api.createProfile({
        name: form.name,
        email: form.email,
        password: form.password,
        age: form.age,
        gender: form.gender,
      })
      setProfile(res.data)
      localStorage.setItem('userId', res.data.id)
      setSuccess('✅ สมัครสมาชิกสำเร็จ!')
    } catch (e: any) { setError('❌ ' + e.message) }
    finally { setLoading(false) }
  }

  const login = async () => {
    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setError('⚠️ กรุณากรอกอีเมลและรหัสผ่าน')
      return
    }
    setLoading(true); setError(null); setSuccess(null)
    try {
      const res = await api.loginByEmail(loginForm.email, loginForm.password)
      setProfile(res.data)
      localStorage.setItem('userId', res.data.id)
      setSuccess('✅ เข้าสู่ระบบสำเร็จ!')
    } catch (e: any) { setError('❌ ' + e.message) }
    finally { setLoading(false) }
  }

  const logout = () => {
    localStorage.removeItem('userId')
    setProfile(null)
    setForm({ name: '', email: '', password: '', age: 30, gender: 'male' })
    setLoginForm({ email: '', password: '' })
    setSuccess(null)
    setError(null)
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
        <h1>👤 {mode === 'register' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</h1>
        <p>{mode === 'register' ? 'สร้างบัญชีเพื่อเริ่มประเมินความเสี่ยง' : 'เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน'}</p>
      </div>

      <div className="card">
        {mode === 'register' ? (
          <>
            <div className="form-group">
              <label>ชื่อ-นามสกุล *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="เช่น สมชาย ใจดี" />
            </div>
            <div className="form-group">
              <label>อีเมล *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="เช่น somchai@email.com" />
            </div>
            <div className="form-group">
              <label>รหัสผ่าน * <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(อย่างน้อย 6 ตัวอักษร)</span></label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
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
            <button className="btn btn-primary" onClick={register} disabled={loading} style={{ width: '100%' }}>
              {loading ? 'กำลังสมัคร...' : '✅ สมัครสมาชิก'}
            </button>
            <button className="btn btn-outline" onClick={() => { setMode('login'); setError(null); setSuccess(null) }} style={{ width: '100%', marginTop: '0.5rem' }}>
              มีบัญชีแล้ว? เข้าสู่ระบบ
            </button>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>อีเมล *</label>
              <input type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} placeholder="เช่น somchai@email.com" />
            </div>
            <div className="form-group">
              <label>รหัสผ่าน *</label>
              <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="••••••••" />
            </div>
            {error && <p style={{ color: 'var(--danger)', marginBottom: '0.75rem' }}>{error}</p>}
            {success && <p style={{ color: 'var(--success)', marginBottom: '0.75rem' }}>{success}</p>}
            <button className="btn btn-primary" onClick={login} disabled={loading} style={{ width: '100%' }}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
            <button className="btn btn-outline" onClick={() => { setMode('register'); setError(null); setSuccess(null) }} style={{ width: '100%', marginTop: '0.5rem' }}>
              ยังไม่มีบัญชี? สมัครสมาชิก
            </button>
          </>
        )}
      </div>
    </div>
  )
}