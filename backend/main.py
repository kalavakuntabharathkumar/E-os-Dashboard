from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from models import Base, engine, User, Employee, Lead, InventoryItem, Transaction, Task
from auth import hash_password
from routers import router

app = FastAPI(title="Unified Enterprise OS", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
def seed_db():
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        if db.query(User).count() > 0:
            return
        users = [
            User(name="Admin User",    email="admin@eos.com",   password_hash=hash_password("admin123"),   role="Admin",    department="IT"),
            User(name="HR Manager",    email="hr@eos.com",      password_hash=hash_password("hr123"),      role="HR",       department="HR"),
            User(name="Sales Rep",     email="sales@eos.com",   password_hash=hash_password("sales123"),   role="Sales",    department="Sales"),
            User(name="Finance Lead",  email="finance@eos.com", password_hash=hash_password("finance123"), role="Finance",  department="Finance"),
            User(name="Project Mgr",   email="pm@eos.com",      password_hash=hash_password("pm123"),      role="PM",       department="Engineering"),
            User(name="Employee One",  email="emp@eos.com",     password_hash=hash_password("emp123"),     role="Employee", department="Engineering"),
        ]
        employees = [
            Employee(name="Alice Chen",    role="Engineer",   department="Engineering"),
            Employee(name="Bob Singh",     role="Designer",   department="Product"),
            Employee(name="Carol White",   role="Analyst",    department="Finance"),
        ]
        leads = [
            Lead(name="Acme Corp",    status="New"),
            Lead(name="Globex Inc",   status="Contacted"),
            Lead(name="Initech",      status="Closed"),
        ]
        inventory = [
            InventoryItem(item="Laptop",  quantity=20, status="In Stock"),
            InventoryItem(item="Monitor", quantity=5,  status="Low"),
        ]
        transactions = [
            Transaction(type="Revenue",  amount=5000.0, date="2024-01-15"),
            Transaction(type="Expense",  amount=1200.0, date="2024-01-20"),
            Transaction(type="Revenue",  amount=3400.0, date="2024-02-01"),
        ]
        tasks = [
            Task(title="Setup CI pipeline",    status="Done"),
            Task(title="Design DB schema",     status="Done"),
            Task(title="Build auth module",    status="In Progress"),
            Task(title="Write API docs",       status="To Do"),
        ]
        db.add_all(users + employees + leads + inventory + transactions + tasks)
        db.commit()
