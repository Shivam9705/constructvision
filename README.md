# ConstructVision AI

> **AI-Powered Construction Cost Estimation, BOQ Generation, and Construction Intelligence Platform**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://constructvision.vercel.app)
[![Backend](https://img.shields.io/badge/api-render-blue)](https://constructvision-api.onrender.com/docs)

---

## What it does

ConstructVision AI lets civil engineers and contractors generate a complete **Bill of Quantities (BOQ)** with 40–55 line items in under 60 seconds from just a project description. No more 3-day manual Excel estimation.

**Enter project specs → Gemini AI generates BOQ → Download PDF or Excel**

---

## Live URLs

| Service  | URL |
|----------|-----|
| Frontend | https://constructvision.vercel.app |
| API Docs | https://constructvision-api.onrender.com/docs |
| Health   | https://constructvision-api.onrender.com/health |

> Render free tier spins down after inactivity. First request may take 30s.

---

## Features

| Feature | Description |
|---------|-------------|
| AI Cost Estimation | Gemini 2.0 Flash generates BOQ using CPWD/PWD rate schedules |
| Editable BOQ Table | 40–55 line items grouped by category, inline-editable |
| Cost Breakdown Charts | Donut + bar charts |
| AI Intelligence Report | Risk assessment, construction timeline, market benchmarking |
| PDF Export | Professional A4 report with ReportLab |
| Excel Export | 3-sheet workbook with chart using openpyxl |
| Blueprint Upload | Upload floor plan → Gemini Vision extracts room areas |
| Project Comparison | Compare 2–4 projects side by side |
| Auth | JWT-based with NextAuth.js |

---

## Tech Stack

```
Frontend: Next.js 15, TypeScript, TailwindCSS, Shadcn UI, React Query, Recharts
Backend:  FastAPI, Python 3.12, SQLAlchemy 2.0, Alembic, PostgreSQL, Pydantic v2
AI:       Google Gemini 2.0 Flash, Gemini Vision
Export:   ReportLab (PDF), openpyxl (Excel)
Deploy:   Vercel (frontend), Render (backend + PostgreSQL)
```

---

## Local Setup

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # fill in DATABASE_URL, SECRET_KEY, GEMINI_API_KEY
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local   # fill in NEXT_PUBLIC_API_URL, NEXTAUTH_SECRET
npm run dev
```

---

## Deploy

### Backend → Render
1. Push `backend/` to GitHub
2. New Web Service → connect repo → Render detects Dockerfile
3. Add `GEMINI_API_KEY` in Render dashboard
4. Create PostgreSQL database → `DATABASE_URL` auto-wires
5. Deploy — `start.sh` runs `alembic upgrade head` then starts uvicorn

### Frontend → Vercel
```bash
cd frontend && npx vercel
```
Set: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`

### Smoke test
```bash
pip install httpx
python backend/smoke_test.py https://constructvision-api.onrender.com
```

---

## API Reference (25 endpoints)

```
Auth:         POST /register, /login | GET /me
Projects:     GET/POST /projects | GET/PUT/DELETE /projects/{id} | POST /projects/{id}/upload
Estimation:   POST /estimate | GET /estimate/project/{id}/latest | PATCH /estimate/boq/{item_id}
Export:       GET /export/pdf/{id} | GET /export/excel/{id}
Intelligence: GET /intelligence/report/{id} | POST /intelligence/compare
```

Full docs: /docs

---

## Resume Description

> Built **ConstructVision AI**, a full-stack SaaS platform for AI-powered construction cost estimation. Integrated Google Gemini 2.0 to generate Bills of Quantities (BOQ) aligned with CPWD/PWD rate schedules. Features PDF/Excel export, AI intelligence reports with risk assessment, blueprint image analysis via Gemini Vision, and project comparison. Deployed on Vercel + Render.
>
> **Stack:** Next.js 15, TypeScript, FastAPI, Python, PostgreSQL, TailwindCSS, ReportLab, openpyxl, Google Gemini API

---

## Built in 7 days
| Day | Built |
|-----|-------|
| 1 | Auth system, project skeleton, first deploy |
| 2 | Project CRUD, dashboard UI, file upload |
| 3 | Gemini AI integration, BOQ generation |
| 4 | Editable BOQ table, charts, material schedule |
| 5 | PDF + Excel export |
| 6 | AI intelligence report, project comparison, landing page |
| 7 | Production hardening, migrations, CI, smoke tests |
