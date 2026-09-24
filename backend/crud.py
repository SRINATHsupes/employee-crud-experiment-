from sqlalchemy.orm import Session
from models import Employee
from schemas import EmployeeCreate


def get_employees(db: Session):
    return db.query(Employee).all()


def get_employee(db: Session, employee_id: str):
    return db.query(Employee).filter(Employee.id == employee_id).first()


def create_employee(db: Session, employee: EmployeeCreate):
    new_employee = Employee(
        id=employee.id,
        name=employee.name,
        department=employee.department,
        salary=employee.salary
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    return new_employee


def update_employee(
    db: Session,
    employee_id: str,
    employee: EmployeeCreate
):
    existing_employee = get_employee(db, employee_id)

    if existing_employee is None:
        return None

    existing_employee.name = employee.name
    existing_employee.department = employee.department
    existing_employee.salary = employee.salary

    db.commit()
    db.refresh(existing_employee)

    return existing_employee


def delete_employee(db: Session, employee_id: str):
    existing_employee = get_employee(db, employee_id)

    if existing_employee is None:
        return None

    db.delete(existing_employee)
    db.commit()

    return existing_employee