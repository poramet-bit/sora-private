export default function About() {
  return (
    <div>
      <div className="page-header"><h1>ℹ️ เกี่ยวกับเรา</h1></div>

      <div className="card">
        <h2>🏥 AI ประเมินความเสี่ยงด้านสุขภาพ</h2>
        <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
          ระบบประเมินความเสี่ยงด้านสุขภาพเบื้องต้นจากรูปภาพและข้อมูลผู้ใช้ โดยใช้ AI ช่วยวิเคราะห์
        </p>

        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>⚙️ เทคโนโลยีที่ใช้</h3>
        <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
          <li>ส่วนหน้า: React + Vite + TypeScript</li>
          <li>ส่วนหลัง: Hono + Cloudflare Workers</li>
          <li>ฐานข้อมูล: Cloudflare D1 (SQLite)</li>
          <li>การปรับใช้งาน: Cloudflare Pages + Workers</li>
        </ul>

        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>📊 ระดับความเสี่ยง</h3>
        <ul style={{ marginLeft: '1.5rem', color: 'var(--text-muted)' }}>
          <li><span className="badge badge-low">ต่ำ</span> คะแนน &lt; 25 — สุขภาพดี</li>
          <li><span className="badge badge-moderate">ปานกลาง</span> คะแนน 25-44 — ควรเฝ้าระวัง</li>
          <li><span className="badge badge-high">สูง</span> คะแนน 45-69 — ควรพบแพทย์</li>
          <li><span className="badge badge-critical">วิกฤต</span> คะแนน ≥ 70 — ด่วน ไปโรงพยาบาล</li>
        </ul>

        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>🤖 ปัจจัยที่ AI วิเคราะห์</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div style={{ padding: '0.5rem', background: 'var(--bg)', borderRadius: '8px' }}>⚖️ BMI (น้ำหนัก/ส่วนสูง)</div>
          <div style={{ padding: '0.5rem', background: 'var(--bg)', borderRadius: '8px' }}>🫀 ความดันโลหิต</div>
          <div style={{ padding: '0.5rem', background: 'var(--bg)', borderRadius: '8px' }}>❤️ อัตราการเต้นหัวใจ</div>
          <div style={{ padding: '0.5rem', background: 'var(--bg)', borderRadius: '8px' }}>🌡️ อุณหภูมิร่างกาย</div>
          <div style={{ padding: '0.5rem', background: 'var(--bg)', borderRadius: '8px' }}>🎂 อายุ</div>
          <div style={{ padding: '0.5rem', background: 'var(--bg)', borderRadius: '8px' }}>🩺 อาการที่พบ</div>
        </div>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
          <p style={{ fontSize: '0.9rem', color: '#92400e' }}>
            ⚠️ <strong>ข้อควรระวัง:</strong> ผลการประเมินเป็นเพียงการประเมินเบื้องต้นโดย AI
            ไม่ใช่การวินิจฉัยทางการแพทย์ หากมีอาการรุนแรงควรไปพบแพทย์ทันที
          </p>
        </div>
      </div>
    </div>
  )
}
