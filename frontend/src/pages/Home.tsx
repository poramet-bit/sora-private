import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div>
      <div className="page-header">
        <h1>🏥 ngernngern_thongthong</h1>
        <p>ระบบประเมินความเสี่ยงด้านสุขภาพเบื้องต้นจากรูปภาพและข้อมูลผู้ใช้</p>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>เริ่มประเมินสุขภาพของคุณ</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          อัปโหลดรูปภาพ กรอกข้อมูลสุขภาพ แล้วระบบจะประเมินความเสี่ยงเบื้องต้นให้ทันที
        </p>
        <Link to="/upload" className="btn btn-primary" style={{ fontSize: '1.1rem' }}>
          เริ่มประเมิน →
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem' }}>📷</div>
          <h3 style={{ margin: '0.5rem 0' }}>1. อัปโหลดรูป</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>ถ่ายหรือเลือกรูปภาพ</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem' }}>📝</div>
          <h3 style={{ margin: '0.5rem 0' }}>2. กรอกข้อมูล</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>ใส่ข้อมูลสุขภาพ</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem' }}>📊</div>
          <h3 style={{ margin: '0.5rem 0' }}>3. ดูผลลัพธ์</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>รับคำแนะนำทันที</p>
        </div>
      </div>
    </div>
  )
}
