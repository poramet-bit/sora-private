import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../services/api'

export default function Upload() {
  const [preview, setPreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const handleFile = async (file: File) => {
    setError(null)
    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)

      const res = await api.uploadImage(file)
      setImageUrl(res.data.imageUrl)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>📷 อัปโหลดรูปภาพ</h1>
        <p>เลือกรูปภาพเพื่อประกอบการประเมิน (ขั้นตอนที่ 1 จาก 3)</p>
      </div>

      <div className="card">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="user"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {preview ? (
          <div style={{ textAlign: 'center' }}>
            <img src={preview} alt="ตัวอย่างรูป" style={{ maxWidth: '300px', borderRadius: '12px', marginBottom: '1rem' }} />
            <div>
              <button className="btn btn-outline" onClick={() => fileRef.current?.click()} style={{ marginRight: '0.5rem' }}>
                เลือกรูปใหม่
              </button>
              <button
                className="btn btn-primary"
                disabled={uploading}
                onClick={() => navigate('/analyze', { state: { imageUrl: imageUrl || preview } })}
              >
                {uploading ? 'กำลังเตรียมรูป...' : 'ถัดไป →'}
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileRef.current?.click()}
            style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border)', borderRadius: '12px', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📤</div>
            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>คลิกเพื่อเลือกรูปภาพ</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>หรือถ่ายรูปจากกล้องได้</p>
          </div>
        )}

        {uploading && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--primary)' }}>กำลังอัปโหลด...</p>}
        {error && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--danger)' }}>❌ {error}</p>}

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <Link to="/" className="btn btn-outline">← กลับหน้าแรก</Link>
          <button className="btn btn-outline" onClick={() => navigate('/analyze')}>ข้ามขั้นตอนนี้ →</button>
        </div>
      </div>
    </div>
  )
}
