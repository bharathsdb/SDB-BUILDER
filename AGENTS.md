<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:plancraft-architecture -->
# PlanCraftAI Architecture

## Overview
PlanCraftAI is a Python-first architecture platform with a Next.js frontend.

## Architecture
```
Frontend (Next.js + React + TypeScript + TailwindCSS)
    ↓ (Next.js rewrites proxy /api/* to Python backend)
FastAPI Gateway (Python 3.12+)
    ↓
Services Layer
    ↓
Database Layer (PostgreSQL + SQLAlchemy + Alembic)
```

## Backend (Python) - `backend/`
- **Framework**: FastAPI with async SQLAlchemy
- **Auth**: JWT Bearer tokens (access + refresh)
- **Database**: PostgreSQL via SQLAlchemy 2.0 async
- **Migrations**: Alembic
- **Cache/Queue**: Redis + Celery
- **AI**: Local architect engine (no external APIs)
- **Rendering**: Pillow + svgwrite + reportlab + trimesh
- **Image Processing**: OpenCV
- **ML**: PyTorch + ONNX export

## Frontend (Next.js) - `src/`
- All API calls go through `/api/*` which is proxied to `http://localhost:8000/api/*` via `next.config.ts` rewrites
- Auth tokens stored in localStorage, sent as `Authorization: Bearer <token>` header
- Auth cookie `plancraft_auth` set by client for middleware protection

## Setup & Running

### Backend (Python)
```bash
cd backend
pip install -r requirements.txt
# Start PostgreSQL and Redis
uvicorn app.main:app --reload --port 8000
# Or with Docker:
docker-compose up -d
# Seed database:
python -m app.seed
```

### Frontend (Next.js)
```bash
npm run dev  # Starts on :3000, proxies /api/* to :8000
```

## Key API Endpoints
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Register
- `GET /api/auth/me` - Current user
- `GET/POST /api/projects` - Project CRUD
- `POST /api/projects/:id/generate` - Generate floor plan
- `POST /api/ai/chat` - AI chat assistant
- `POST /api/ai/generate` - AI plan generation
- `POST /api/cv/extract-plan` - Blueprint image analysis
- `POST /api/render/glb` - 3D GLB generation
- `POST /api/exports` - Export (PDF, PNG, SVG)
- `POST /api/payments/paytm/checkout` - Payment initiation
- `GET /api/payments/paytm/history` - Transaction history

## AI System
The AI Architect Engine runs entirely locally in `backend/app/ai/`:
- 10 specialized modules (space planner, vastu engine, cost optimizer, etc.)
- Rule-based + constraint-based architecture
- PyTorch ML model for future fine-tuning
- ONNX export support

## Database Tables (24 tables)
users, user_sessions, projects, floor_plans, rooms, floors, templates,
subscription_plans, subscriptions, transactions, exports, notifications,
messages, teams, team_members, comments, reviews, marketplace_listings,
architects, builders, ai_conversations, render_jobs, media_assets,
activity_logs, settings, audit_logs
<!-- END:plancraft-architecture -->
