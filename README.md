# 🏥 AI Health Risk Assessment — ngernngern_thongthong

เว็บแอประบบประเมินความเสี่ยงด้านสุขภาพเบื้องต้น โดยใช้ AI (Cloudflare Workers AI — OpenAI gpt-oss-20b) วิเคราะห์ข้อมูลสุขภาพของผู้ใช้ พร้อมให้คำแนะนำเชิงลึกเป็นภาษาไทย

---

## 📌 ข้อมูลพื้นฐานของโปรเจกต์

| รายการ | รายละเอียด |
|--------|-----------|
| **ชื่อโปรเจกต์** | AI Health Risk Assessment |
| **Repo** | `https://github.com/poramet-bit/sora-private` |
| **Frontend URL** | `https://ai-health-risk-assessment.pages.dev/` |
| **Backend URL** | `https://ai-health-risk-assessment-backend.porametq7.workers.dev/` |
| **D1 Database** | `ngernngern-thongthong-db` |

## 🛠 Tech Stack

| ส่วน | เทคโนโลยี |
|------|----------|
| Frontend | React 19 + Vite 6 + TypeScript 5 |
| Backend | Hono 4 + Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| AI | Cloudflare Workers AI — `@cf/openai/gpt-oss-20b` |
| Deploy | Cloudflare Pages (Frontend) + Cloudflare Workers (Backend) |
| CI/CD | GitHub Actions (push to `main` → auto deploy) |
| Auth | Email + Password (SHA-256 + salt hashing) |

## 📁 โครงสร้างโปรเจกต์

```
ngernngern_thongthong_v2/
├── .github/workflows/
│   └── deploy.yml              # GitHub Actions — auto deploy เมื่อ push to main
├── backend/                    # Backend (Hono + Cloudflare Workers)
│   ├── migrations/
│   │   └── 0001_init.sql       # สร้างตาราง users, health_records, analysis_results
│   ├── src/
│   │   ├── index.ts            # Entry point — Hono app, CORS, health check
│   │   ├── routes/
│   │   │   └── index.ts        # Route definitions (/api/login, /profile, /analyze, ฯลฯ)
│   │   ├── controllers/
│   │   │   ├── user-controller.ts   # จัดการสมัคร/ล็อกอิน/โปรไฟล์
│   │   │   └── health-controller.ts # จัดการอัปโหลด/ประเมิน/ประวัติ
│   │   ├── services/
│   │   │   ├── analysis-service.ts   # Rule-based risk scoring (fallback)
│   │   │   └── ai-service.ts        # เรียก Workers AI วิเคราะห์สุขภาพ
│   │   ├── repositories/
│   │   │   ├── user-repository.ts    # Query ตาราง users
│   │   │   └── health-repository.ts # Query ตาราง health_records + analysis_results
│   │   ├── models/
│   │   │   └── types.ts             # TypeScript types & DTOs
│   │   └── utils/
│   │       └── crypto.ts            # Password hashing (SHA-256 + salt)
│   ├── package.json
│   ├── tsconfig.json
│   └── wrangler.jsonc          # Cloudflare Workers config (D1 + AI bindings)
├── frontend/                   # Frontend (React + Vite + TypeScript)
│   ├── src/
│   │   ├── App.tsx             # Main app — routing + navbar
│   │   ├── main.tsx            # React entry point
│   │   ├── pages/
│   │   │   ├── Home.tsx        # หน้าแรก — ภาพรวม + สถิติ
│   │   │   ├── Profile.tsx     # สมัครสมาชิก / เข้าสู่ระบบ (email + password)
│   │   │   ├── Upload.tsx      # อัปโหลดรูปภาพ (ไม่บังคับ)
│   │   │   ├── Analyze.tsx     # กรอกข้อมูลสุขภาพ + ประเมินความเสี่ยง
│   │   │   ├── Result.tsx      # แสดงผลลัพธ์การประเมิน (คะแนน, ระดับความเสี่ยง, คำแนะนำ AI)
│   │   │   ├── History.tsx     # ประวัติการประเมิน (ต้องล็อกอิน)
│   │   │   └── About.tsx      # ข้อมูลเกี่ยวกับแอป
│   │   ├── services/
│   │   │   └── api.ts          # API client — เรียก backend endpoints
│   │   └── assets/
│   │       └── styles.css      # สไตล์ทั้งหมด
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── package.json                # Root — scripts รวมสำหรับ dev/deploy
├── deploy-plan.md
├── .gitignore
└── README.md                   # ไฟล์นี้
```

## 🗄 Database Schema (D1)

### ตาราง `users`
| คอลัมน์ | ประเภท | รายละเอียด |
|---------|--------|----------|
| id | TEXT PK | UUID |
| name | TEXT | ชื่อ-นามสกุล |
| email | TEXT UNIQUE | อีเมล (ใช้ล็อกอิน) |
| password | TEXT | Hash (SHA-256 + salt) |
| age | INTEGER | อายุ |
| gender | TEXT | male / female / other |
| created_at | TEXT | ISO timestamp |

### ตาราง `health_records`
| คอลัมน์ | ประเภท | รายละเอียด |
|---------|--------|----------|
| id | TEXT PK | UUID |
| user_id | TEXT FK → users.id | |
| image_url | TEXT (nullable) | Base64 data URL |
| age, gender, weight, height | | ข้อมูลพื้นฐาน |
| bp_systolic, bp_diastolic | INTEGER (nullable) | ความดัน (ไม่บังคับกรอก) |
| heart_rate | INTEGER (nullable) | อัตราหัวใจ (ไม่บังคับกรอก) |
| body_temp | REAL (nullable) | อุณหภูมิ (ไม่บังคับกรอก) |
| symptoms | TEXT | อาการที่พบ |
| medical_history | TEXT | ประวัติแพทย์ |
| created_at | TEXT | ISO timestamp |

### ตาราง `analysis_results`
| คอลัมน์ | ประเภท | รายละเอียด |
|---------|--------|----------|
| id | TEXT PK | UUID |
| health_record_id | TEXT FK → health_records.id | |
| user_id | TEXT FK → users.id | |
| risk_level | TEXT | low / moderate / high / critical |
| risk_score | INTEGER | 0-100 |
| bmi | REAL | ค่า BMI |
| recommendations | TEXT | คำแนะนำ (คั่นด้วย \n) |
| factors | TEXT | ปัจจัยเสี่ยง (คั่นด้วย \n) |
| created_at | TEXT | ISO timestamp |

---

## 🚀 วิธีรันโปรเจกต์ในเครื่อง (Local Development)

### สิ่งที่ต้องมี (Prerequisites)
- Node.js เวอร์ชัน 18 ขึ้นไป
- npm (หรือ pnpm / yarn)
- Cloudflare account (สำหรับ D1 + Workers AI)

### 1. Clone repo
```bash
git clone https://github.com/poramet-bit/sora-private.git
cd sora-private
```

### 2. ติดตั้ง dependencies
```bash
# ติดตั้ง backend
cd backend
npm install

# ติดตั้ง frontend
cd ../frontend
npm install
```

### 3. ตั้งค่า environment
```bash
# สร้างไฟล์ .env ใน frontend/
cp frontend/.env.example frontend/.env
# แก้ VITE_API_BASE_URL ให้ชี้ไป backend ในเครื่อง:
# VITE_API_BASE_URL=http://localhost:8787
```

### 4. รัน database migration (local)
```bash
cd backend
npx wrangler d1 migrations apply ngernngern-thongthong-db --local
```

### 5. รัน backend (local)
```bash
cd backend
npm run dev
# Backend จะรันที่ http://localhost:8787
```

### 6. รัน frontend (เปิด terminal ใหม่)
```bash
cd frontend
npm run dev
# Frontend จะรันที่ http://localhost:5173
```

### 7. เปิดเบราว์เซอร์
ไปที่ `http://localhost:5173`

---

## 📖 คู่มือการใช้งาน (User Guide)

### ขั้นตอนที่ 0: สมัครสมาชิก / เข้าสู่ระบบ
1. ไปที่หน้า **โปรไฟล์** ในเมนูบาร์
2. ถ้ายังไม่มีบัญชี → กรอก **ชื่อ, อีเมล, รหัสผ่าน (6 ตัวขึ้นไป), อายุ, เพศ** → กด **สมัครสมาชิก**
3. ถ้ามีบัญชีแล้ว → กด **"มีบัญชีแล้ว? เข้าสู่ระบบ"** → กรอก **อีเมล + รหัสผ่าน** → กด **เข้าสู่ระบบ**
4. หลังล็อกอินสำเร็จ ระบบจะจำ userId ไว้ใน localStorage

### ขั้นตอนที่ 1: อัปโหลดรูปภาพ (ไม่บังคับ)
1. ไปที่หน้า **อัปโหลดรูป**
2. คลิกที่พื้นที่อัปโหลด → เลือกรูป หรือถ่ายรูปจากกล้อง
3. รออัปโหลดเสร็จ → กด **"ถัดไป →"**
4. หรือกด **"ข้ามขั้นตอนนี้ →"** เพื่อข้ามไปเลย

### ขั้นตอนที่ 2: กรอกข้อมูลสุขภาพ
1. ไปที่หน้า **ประเมิน**
2. กรอกข้อมูล: **อายุ, เพศ, น้ำหนัก, ส่วนสูง**
3. กรอก **อาการปัจจุบัน** (บังคับ — เช่น "ปวดหัว, เหนื่อยง่าย")
4. กรอก **ประวัติการแพทย์** (ไม่บังคับ — เช่น "เบาหวาน, ความดันสูง")
5. กดปุ่ม **"🔍 ให้ AI ประเมินความเสี่ยง"**
6. รอ AI วิเคราะห์ (ใช้เวลา ~3-10 วินาที)

### ขั้นตอนที่ 3: ดูผลลัพธ์
1. หลัง AI วิเคราะห์เสร็จ จะเปลี่ยนไปหน้า **ผลการประเมิน** อัตโนมัติ
2. หน้าผลลัพธ์จะแสดง:
   - **ระดับความเสี่ยง** (🟢 ต่ำ / 🟡 ปานกลาง / 🔴 สูง / 🟣 วิกฤต)
   - **คะแนนความเสี่ยง** (0-100)
   - **ค่า BMI**
   - **สรุปจาก AI** (เป็นภาษาไทย 2-3 ประโยค)
   - **ปัจจัยที่ AI พบ** (รายการปัจจัยเสี่ยง)
   - **คำแนะนำจาก AI** (คำแนะนำเชิงปฏิบัติ)
3. กด **"📋 ดูประวัติทั้งหมด"** เพื่อดูประวัติการประเมินทั้งหมด

### ขั้นตอนที่ 4: ดูประวัติ
1. ไปที่หน้า **ประวัติ** ในเมนูบาร์
2. ถ้ายังไม่ล็อกอิน → จะขึ้น "🔒 กรุณาเข้าสู่ระบบก่อน"
3. ถ้าล็อกอินแล้ว → จะเห็นประวัติการประเมินทั้งหมดของคุณ
4. คลิกที่รายการเพื่อดูผลลัพธ์แบบละเอียด

---

## 🔌 API Endpoints

| Method | Path | รายละเอียด | ต้องล็อกอิน |
|--------|------|-----------|------------|
| POST | `/api/profile` | สมัครสมาชิก (name, email, password, age, gender) | ไม่ |
| POST | `/api/login` | เข้าสู่ระบบ (email, password) | ไม่ |
| GET | `/api/profile/:userId` | ดูข้อมูลผู้ใช้ | ไม่ |
| PATCH | `/api/profile/:userId` | แก้ไขโปรไฟล์ | ไม่ |
| POST | `/api/upload` | อัปโหลดรูปภาพ (multipart/form-data) | ไม่ |
| POST | `/api/analyze` | ประเมินความเสี่ยง — ส่งข้อมูลสุขภาพ → AI วิเคราะห์ | ใช่ (ต้องมี userId) |
| GET | `/api/history?userId=xxx` | ดูประวัติการประเมินของผู้ใช้ | ใช่ |
| GET | `/api/analysis/:id` | ดูผลลัพธ์การประเมินแบบละเอียด | ไม่ |
| GET | `/health` | Health check | ไม่ |

### ตัวอย่างการเรียก API

**สมัครสมาชิก:**
```bash
curl -X POST https://ai-health-risk-assessment-backend.porametq7.workers.dev/api/profile \
  -H "Content-Type: application/json" \
  -d '{"name":"สมชาย","email":"somchai@test.com","password":"mypassword","age":35,"gender":"male"}'
```

**เข้าสู่ระบบ:**
```bash
curl -X POST https://ai-health-risk-assessment-backend.porametq7.workers.dev/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"somchai@test.com","password":"mypassword"}'
```

**ประเมินความเสี่ยง:**
```bash
curl -X POST https://ai-health-risk-assessment-backend.porametq7.workers.dev/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"userId":"<id จากการล็อกอิน>","age":35,"gender":"male","weight":70,"height":170,"symptoms":"ปวดหัว"}'
```

---

## 🤖 ระบบ AI วิเคราะห์สุขภาพ

### วิธีการทำงาน
1. ผู้ใช้กรอกข้อมูลสุขภาพ (อายุ, เพศ, น้ำหนัก, ส่วนสูง, อาการ, ประวัติแพทย์)
2. Backend คำนวณ BMI จากน้ำหนักและส่วนสูง
3. ส่งข้อมูลทั้งหมดให้ **Cloudflare Workers AI** (โมเดล `@cf/openai/gpt-oss-20b`)
4. AI วิเคราะห์และตอบกลับเป็น JSON:
   - `riskLevel` — ระดับความเสี่ยง (low/moderate/high/critical)
   - `riskScore` — คะแนนความเสี่ยง (0-100)
   - `summary` — สรุปการวิเคราะห์เป็นภาษาไทย
   - `factors` — ปัจจัยเสี่ยงที่พบ
   - `recommendations` — คำแนะนำเชิงปฏิบัติ
5. บันทึกผลลัพธ์ลง D1 database
6. ส่งผลลัพธ์กลับไปแสดงที่ frontend

### Fallback (ถ้า AI ไม่พร้อมใช้งาน)
- ระบบจะใช้ **rule-based scoring** แทนอัตโนมัติ
- คำนวณจาก: BMI, อายุ, ความดัน (ถ้ามี), อัตราหัวใจ (ถ้ามี), ไข้ (ถ้ามี), อาการ
- คะแนน: `<25` ต่ำ, `25-44` ปานกลาง, `45-69` สูง, `≥70` วิกฤต

---

## 🔐 ระบบ Authentication

- สมัครด้วย **อีเมล + รหัสผ่าน**
- รหัสผ่านถูก hash ด้วย **SHA-256 + salt** (ไม่เก็บ plain text)
- หลังล็อกอินสำเร็จ → เก็บ `userId` ใน `localStorage`
- ถ้าไม่ล็อกอิน → หน้าประเมินและหน้าประวัติจะไม่ให้ใช้งาน

---

## 🚀 วิธี Deploy

### Auto Deploy (ผ่าน GitHub Actions)
1. Commit และ push ไปยัง branch `main`
2. GitHub Actions จะทำงานอัตโนมัติ:
   - **Backend**: typecheck → apply migrations → `wrangler deploy`
   - **Frontend**: typecheck → build → `wrangler pages deploy`
3. ดูสถานะได้ที่ `https://github.com/poramet-bit/sora-private/actions`

### Manual Deploy

**Backend:**
```bash
cd backend
npm run deploy
```

**Frontend:**
```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=ai-health-risk-assessment --branch=main
```

### GitHub Secrets ที่ต้องตั้ง (Settings → Secrets → Actions)
| Secret | รายละเอียด |
|--------|-----------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token (สิทธิ์ Workers + D1 + Pages + AI) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID |
| `D1_DATABASE_ID` | D1 database ID |
| `VITE_API_BASE_URL` | Backend URL ที่ frontend จะเรียก (เช่น `https://ai-health-risk-assessment-backend.porametq7.workers.dev`) |

---

## 📋 การจัดการ Database (D1)

### รัน migration
```bash
cd backend
# Local
npm run db:migrate:local
# Remote (production)
npm run db:migrate:remote
```

### ดูข้อมูลใน D1
```bash
npx wrangler d1 execute ngernngern-thongthong-db --remote --command "SELECT * FROM users;"
```

### ล้างข้อมูลทั้งหมด
```bash
npx wrangler d1 execute ngernngern-thongthong-db --remote \
  --command "DELETE FROM analysis_results; DELETE FROM health_records; DELETE FROM users;"
```

---

## 🧪 คำสั่งที่ใช้บ่อย

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `cd backend && npm run dev` | รัน backend ในเครื่อง (port 8787) |
| `cd frontend && npm run dev` | รัน frontend ในเครื่อง (port 5173) |
| `cd backend && npx tsc --noEmit` | ตรวจสอบ TypeScript errors (backend) |
| `cd frontend && npx tsc --noEmit` | ตรวจสอบ TypeScript errors (frontend) |
| `cd frontend && npm run build` | Build frontend สำหรับ production |
| `cd backend && npm run deploy` | Deploy backend ไป Cloudflare Workers |
| `cd backend && npm run db:migrate:remote` | รัน migration บน D1 (production) |

---

## ⚠️ ข้อควรระวัง

- ผลการประเมินเป็น **เพียงการประเมินเบื้องต้น** ไม่ใช่การวินิจฉัยทางการแพทย์
- ควรปรึกษาแพทย์เสมอสำหรับการวินิจฉัยที่แม่นยำ
- รูปภาพถูกเก็บเป็น Base64 ใน D1 (ใน production ควรใช้ Cloudflare R2 หรือ Images)
- รหัสผ่านถูก hash ด้วย SHA-256 + salt (ไม่ได้ใช้ bcrypt เพราะ Workers runtime ไม่รองรับ)

---

## 👤 ข้อมูลผู้สร้าง

- **Owner**: Poramet-bit
- **Email**: porametq7@gmail.com
- **GitHub**: https://github.com/poramet-bit/sora-private