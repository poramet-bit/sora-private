# Deploy Plan — ngernngern_thongthong

## Prerequisites
- Cloudflare account (free)
- GitHub account
- Node.js 22+

## Step 1: GitHub Setup
```bash
git remote add origin https://github.com/<user>/<repo>.git
git branch -M main
git push -u origin main
```

## Step 2: Cloudflare Resources (ต้อง login ก่อน)
```bash
# Login Cloudflare
npx wrangler login

# Create D1 database
cd backend
npx wrangler d1 create ngernngern-thongthong-db
# → เก็บ database_id

# Apply migrations
npx wrangler d1 migrations apply ngernngern-thongthong-db --remote

# Deploy backend
npm run deploy
# → เก็บ backend URL
```

## Step 3: Deploy Frontend
```bash
cd frontend
npm install
VITE_API_BASE_URL="<backend-url>" npm run build
npx wrangler pages deploy dist --project-name=ngernngern-thongthong --branch=main
```

## Step 4: GitHub Secrets (สำหรับ CI/CD)
GitHub repo → Settings → Secrets → Actions

| Secret | Value |
|---|---|
| CLOUDFLARE_API_TOKEN | Token จาก Cloudflare |
| CLOUDFLARE_ACCOUNT_ID | Account ID |
| D1_DATABASE_ID | จาก Step 2 |
| VITE_API_BASE_URL | Backend URL |

## Required Cloudflare Token Permissions
| Scope | Permission |
|---|---|
| Workers Scripts | Edit |
| Cloudflare Pages | Edit |
| D1 | Edit |
