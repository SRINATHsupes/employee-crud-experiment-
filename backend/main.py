from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

import models
import crud
import audit_model

from audit_utils import create_audit_log, employee_snapshot
from auth_routes import router as auth_router, get_current_user, require_admin
from user_routes import router as user_router
from database import engine, get_db
from schemas import EmployeeCreate, EmployeeResponse


models.Base.metadata.create_all(bind=engine)


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(user_router)


@app.get("/")
def home():
    return {"message": "Employee CRUD API is running"}


@app.get("/employees", response_model=list[EmployeeResponse])
def get_all_employees(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return crud.get_employees(db)


@app.post("/employees", response_model=EmployeeResponse)
def create_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    existing_employee = crud.get_employee(db, employee.id)

    if existing_employee:
        raise HTTPException(
            status_code=400,
            detail="Employee ID already exists",
        )

    new_employee = crud.create_employee(db, employee)

    create_audit_log(
        db=db,
        username=current_user.username,
        action="CREATE",
        entity_id=new_employee.id,
        old_value=None,
        new_value=employee_snapshot(new_employee),
    )

    return new_employee


@app.put("/employees/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: str,
    employee: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    existing_employee = crud.get_employee(db, employee_id)

    if existing_employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    old_value = employee_snapshot(existing_employee)

    updated_employee = crud.update_employee(
        db,
        employee_id,
        employee,
    )

    new_value = employee_snapshot(updated_employee)

    create_audit_log(
        db=db,
        username=current_user.username,
        action="UPDATE",
        entity_id=employee_id,
        old_value=old_value,
        new_value=new_value,
    )

    return updated_employee


@app.delete("/employees/{employee_id}")
def delete_employee(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    existing_employee = crud.get_employee(db, employee_id)

    if existing_employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    old_value = employee_snapshot(existing_employee)

    deleted_employee = crud.delete_employee(
        db,
        employee_id,
    )

    create_audit_log(
        db=db,
        username=current_user.username,
        action="DELETE",
        entity_id=employee_id,
        old_value=old_value,
        new_value=None,
    )

    return {
        "message": "Employee deleted successfully",
    }


@app.get("/audit-logs")
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    return (
        db.query(audit_model.AuditLog)
        .order_by(audit_model.AuditLog.created_at.desc())
        .all()
    )
