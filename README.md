# Unified Enterprise OS (E-OS Dashboard)

A minimal proof-of-concept monorepo demonstrating a full-stack enterprise platform with RBAC, modular pages, and code-generated API hooks.

## Stack

**Frontend:** React 19 · TypeScript · Vite · Tailwind CSS v4 · Shadcn UI · TanStack Query · Zustand · React Router DOM v7 · React Hook Form · Zod · Recharts  
**Backend:** Python 3.11 · FastAPI · SQLAlchemy · SQLite · PyJWT · Uvicorn  
**API/Codegen:** OpenAPI 3.0 (auto by FastAPI) · Orval (typed hooks) · pnpm Workspaces

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
pnpm install
pnpm dev:frontend
```

### Regenerate API hooks (requires backend running)
```bash
pnpm generate
```

## Seed Credentials

| Role     | Email              | Password    |
|----------|--------------------|-------------|
| Admin    | admin@eos.com      | admin123    |
| HR       | hr@eos.com         | hr123       |
| Sales    | sales@eos.com      | sales123    |
| Finance  | finance@eos.com    | finance123  |
| PM       | pm@eos.com         | pm123       |
| Employee | emp@eos.com        | emp123      |

## Modules & Access

| Module              | Roles                          |
|---------------------|-------------------------------|
| HRMS                | Admin, HR                     |
| CRM                 | Admin, Sales                  |
| ERP                 | Admin, Finance, PM            |
| Finance             | Admin, Finance                |
| Project Management  | Admin, PM (write), Employee (read) |
| AI Copilot          | All roles                     |
| Analytics           | Admin only                    |

## Workflow Automation

When a CRM lead is created with status `Closed`, a Finance transaction (type: Revenue, amount: 1000) is automatically inserted — no UI needed, pure backend logic.

## AI Copilot

Set `OPENAI_API_KEY` environment variable for live LLM responses. Without it, returns a canned mock response.
