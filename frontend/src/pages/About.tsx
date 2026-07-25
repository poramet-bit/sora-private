export default function About() {
  return (
    <div>
      <div className="page-header"><h1>ℹ️ เกี่ยวกับ</h1></div>
      <div className="card">
        <h2>ngernngern_thongthong</h2>
        <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>ระบบประเมินความเสี่ยงด้านสุขภาพเบื้องต้นจากรูปภาพและข้อมูลผู้ใช้</p>

        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>เทคโนโลยี</h3>
        <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
          <li>Frontend: React + Vite + TypeScript</li>
          <li>Backend: Hono + Cloudflare Workers</li>
          <li>Database: Cloudflare D1 (SQLite)</li>
          <li>Deploy: Cloudflare Pages + Workers</li>
        </ul>

        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>ระดับความเสี่ยง</h3>
        <ul style={{ marginLeft: '1.5rem', color: 'var(--text-muted)' }}>
          <li><span className="badge badge-low">Low</span> คะแนน &lt; 25 — สุขภาพดี</li>
          <li><span className="badge badge-moderate">Moderate</span> คะแนน 25-44 — ควรเฝ้าระวัง</li>
          <li><span className="badge badge-high">High</span> คะแนน 45-69 — ควรพบแพทย์</li>
          <li><span className="badge badge-critical">Critical</span> คะแนน ≥ 70 — ด่วน</li>
        </ul>

        <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          ⚠️ ผลการประเมินเป็นเพียงการประเมินเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์
        </p>
      </div>
    </div>
  )
}
