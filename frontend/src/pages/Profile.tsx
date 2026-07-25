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
      setSuccess('สร้างโปรไฟล์สำเร็จ!')
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const lookup = async () => {
    const id = prompt('กรอก User ID:')
    if (!id) return
    setLoading(true); setError(null)
    try {
      const res = await api.getProfile(id)
      setProfile(res.data)
      localStorage.setItem('userId', res.data.id)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  if (profile) {
    return (
      <div>
        <div className="page-header"><h1>👤 โปรไฟล์</h1></div>
        <div className="card">
          <p><strong>ID:</strong> {profile.id}</p>
          <p><strong>ชื่อ:</strong> {profile.name}</p>
          <p><strong>อีเมล:</strong> {profile.email}</p>
          <p><strong>อายุ:</strong> {profile.age} ปี</p>
          <p><strong>เพศ:</strong> {profile.gender}</p>
          <button className="btn btn-outline" onClick={() => setProfile(null)} style={{ marginTop: '1rem' }}>สร้างใหม่</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header"><h1>👤 สร้างโปรไฟล์</h1><p>สร้างโปรไฟล์ก่อนเริ่มประเมิน</p></div>
      <div className="card">
        <div className="form-group"><label>ชื่อ</label><input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} /></div>
        <div className="form-group"><label>อีเมล</label><input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></div>
        <div className="form-row">
          <div className="form-group"><label>อายุ</label><input type="number" value={form.age} onChange={(e) => setForm({...form, age: Number(e.target.value)})} /></div>
          <div className="form-group"><label>เพศ</label><select value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})}><option value="male">ชาย</option><option value="female">หญิง</option><option value="other">อื่นๆ</option></select></div>
        </div>
        {error && <p style={{ color: 'var(--danger)', marginBottom: '0.75rem' }}>{error}</p>}
        {success && <p style={{ color: 'var(--success)', marginBottom: '0.75rem' }}>{success}</p>}
        <button className="btn btn-primary" onClick={create} disabled={loading} style={{ width: '100%' }}>{loading ? 'กำลังสร้าง...' : 'สร้างโปรไฟล์'}</button>
        <button className="btn btn-outline" onClick={lookup} style={{ width: '100%', marginTop: '0.5rem' }}>มี User ID อยู่แล้ว</button>
      </div>
    </div>
  )
}
