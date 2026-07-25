# ngernngern_thongthong

เว็บแอประบบประเมินความเสี่ยงด้านสุขภาพเบื้องต้นจากรูปภาพและข้อมูลผู้ใช้

## Tech Stack

| | |
|---|---|
| **Frontend** | React 19 + Vite + TypeScript |
| **Backend** | Hono + Cloudflare Workers |
| **Database** | Cloudflare D1 (SQLite) |
| **Deploy** | Cloudflare Workers (backend) + Cloudflare Pages (frontend) |

## โครงสร้างโปรเจกต์

```
ngernngern_thongthong/
├── backend/          # Hono API on Cloudflare Workers
│   ├── src/
│   │   ├── routes/       # API route definitions
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic (analysis engine)
│   │   ├── repositories/ # D1 database queries
│   │   ├── models/       # TypeScript types
│   │   └── index.ts      # App entry
│   ├── migrations/       # SQL migrations
│   └── wrangler.jsonc    # Cloudflare config
├── frontend/         # React SPA
│   ├── src/
│   │   ├── pages/        # Home, Upload, Analyze, Result, History, Profile, About
│   │   ├── services/     # API client
│   │   └── App.tsx       # Router + Layout
│   └── vite.config.ts
├── .github/workflows/    # CI/CD
└── README.md
```

## Local Development

### Backend
```bash
cd backend
npm install
npm run db:migrate:local
npm run dev    # → http://localhost:8787
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev    # → http://localhost:5173
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/profile` | Create user profile |
| GET | `/api/profile/:userId` | Get profile |
| PATCH | `/api/profile/:userId` | Update profile |
| POST | `/api/upload` | Upload image |
| POST | `/api/analyze` | Submit health data + get analysis |
| GET | `/api/history` | List all analyses |
| GET | `/api/history?userId=X` | Filter by user |
| GET | `/api/analysis/:id` | Get analysis detail |

## Risk Levels

| Level | Score | Meaning |
|---|---|---|
| Low | <25 | สุขภาพดี |
| Moderate | 25-44 | ควรเฝ้าระวัง |
| High | 45-69 | ควรพบแพทย์ |
| Critical | ≥70 | ด่วน — ไปโรงพยาบาล |

⚠️ ผลการประเมินเป็นเพียงการประเมินเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์
