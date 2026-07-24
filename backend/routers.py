import os
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from pydantic import BaseModel

from models import Employee, Lead, InventoryItem, Transaction, Task, User, get_db
from auth import create_token, verify_password, require_roles, get_current_user

router = APIRouter()

# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/auth/login", operation_id="login", tags=["auth"])
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": user.id, "role": user.role, "department": user.department, "name": user.name})
    return {"token": token, "role": user.role, "name": user.name, "department": user.department}

# ── HRMS ──────────────────────────────────────────────────────────────────────

class EmployeeIn(BaseModel):
    name: str
    role: str
    department: str

@router.get("/hrms/employees", operation_id="listEmployees", tags=["hrms"])
def list_employees(db: Session = Depends(get_db), _=Depends(require_roles("Admin", "HR"))):
    return db.query(Employee).all()

@router.post("/hrms/employees", operation_id="createEmployee", tags=["hrms"])
def create_employee(body: EmployeeIn, db: Session = Depends(get_db), _=Depends(require_roles("Admin", "HR"))):
    emp = Employee(**body.model_dump())
    db.add(emp); db.commit(); db.refresh(emp)
    return emp

# ── CRM ───────────────────────────────────────────────────────────────────────

class LeadIn(BaseModel):
    name: str
    status: str = "New"

@router.get("/crm/leads", operation_id="listLeads", tags=["crm"])
def list_leads(db: Session = Depends(get_db), _=Depends(require_roles("Admin", "Sales"))):
    return db.query(Lead).all()

@router.post("/crm/leads", operation_id="createLead", tags=["crm"])
def create_lead(body: LeadIn, db: Session = Depends(get_db), _=Depends(require_roles("Admin", "Sales"))):
    lead = Lead(**body.model_dump())
    db.add(lead); db.commit()
    # Workflow Automation: Closed lead → auto-insert Finance transaction
    if body.status == "Closed":
        txn = Transaction(type="Revenue", amount=1000.0, date=str(date.today()))
        db.add(txn); db.commit()
    db.refresh(lead)
    return lead

# ── ERP ───────────────────────────────────────────────────────────────────────

class InventoryIn(BaseModel):
    item: str
    quantity: int
    status: str = "In Stock"

@router.get("/erp/inventory", operation_id="listInventory", tags=["erp"])
def list_inventory(db: Session = Depends(get_db), _=Depends(require_roles("Admin", "Finance", "PM"))):
    return db.query(InventoryItem).all()

@router.post("/erp/inventory", operation_id="createInventoryItem", tags=["erp"])
def create_inventory(body: InventoryIn, db: Session = Depends(get_db), _=Depends(require_roles("Admin"))):
    item = InventoryItem(**body.model_dump())
    db.add(item); db.commit(); db.refresh(item)
    return item

# ── Finance ───────────────────────────────────────────────────────────────────

class TransactionIn(BaseModel):
    type: str
    amount: float
    date: str

@router.get("/finance/transactions", operation_id="listTransactions", tags=["finance"])
def list_transactions(db: Session = Depends(get_db), _=Depends(require_roles("Admin", "Finance"))):
    txns = db.query(Transaction).all()
    total = sum(t.amount for t in txns)
    return {"transactions": txns, "total": total}

@router.post("/finance/transactions", operation_id="createTransaction", tags=["finance"])
def create_transaction(body: TransactionIn, db: Session = Depends(get_db), _=Depends(require_roles("Admin", "Finance"))):
    txn = Transaction(**body.model_dump())
    db.add(txn); db.commit(); db.refresh(txn)
    return txn

# ── Project Management ────────────────────────────────────────────────────────

class TaskIn(BaseModel):
    title: str
    status: str = "To Do"

@router.get("/pm/tasks", operation_id="listTasks", tags=["pm"])
def list_tasks(db: Session = Depends(get_db), _=Depends(require_roles("Admin", "PM", "Employee"))):
    return db.query(Task).all()

@router.post("/pm/tasks", operation_id="createTask", tags=["pm"])
def create_task(body: TaskIn, db: Session = Depends(get_db), _=Depends(require_roles("Admin", "PM"))):
    task = Task(**body.model_dump())
    db.add(task); db.commit(); db.refresh(task)
    return task

# ── AI Copilot ────────────────────────────────────────────────────────────────

class ChatIn(BaseModel):
    message: str

@router.post("/ai/chat", operation_id="aiChat", tags=["ai"])
def ai_chat(body: ChatIn, user: User = Depends(get_current_user)):
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        try:
            import httpx
            resp = httpx.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": body.message}]},
                timeout=30,
            )
            if resp.status_code == 200:
                return {"reply": resp.json()["choices"][0]["message"]["content"]}
        except Exception:
            pass
    return {"reply": f"[Mock] You asked: \"{body.message}\". Set OPENAI_API_KEY for live responses."}

# ── Analytics ─────────────────────────────────────────────────────────────────

@router.get("/analytics/summary", operation_id="analyticsSummary", tags=["analytics"])
def analytics_summary(db: Session = Depends(get_db), _=Depends(require_roles("Admin"))):
    employees = db.query(func.count(Employee.id)).scalar() or 0
    revenue = db.query(func.sum(Transaction.amount)).scalar() or 0.0
    open_tasks = db.query(func.count(Task.id)).filter(Task.status != "Done").scalar() or 0

    leads = db.query(Lead).all()
    leads_by_status: dict[str, int] = {}
    for lead in leads:
        leads_by_status[lead.status] = leads_by_status.get(lead.status, 0) + 1

    tasks = db.query(Task).all()
    tasks_by_status: dict[str, int] = {}
    for task in tasks:
        tasks_by_status[task.status] = tasks_by_status.get(task.status, 0) + 1

    return {
        "employees": employees,
        "revenue": revenue,
        "open_tasks": open_tasks,
        "leads_by_status": [{"status": k, "count": v} for k, v in leads_by_status.items()],
        "tasks_by_status": [{"status": k, "count": v} for k, v in tasks_by_status.items()],
    }
