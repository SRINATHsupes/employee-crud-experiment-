import json

from sqlalchemy.orm import Session

from audit_model import AuditLog


def employee_snapshot(employee):
    if employee is None:
        return None

    return {
        "id": employee.id,
        "name": employee.name,
        "department": employee.department,
        "salary": employee.salary,
    }


def create_audit_log(
    db: Session,
    username: str,
    action: str,
    entity_id: str,
    old_value=None,
    new_value=None,
):
    log = AuditLog(
        username=username,
        action=action,
        entity="employee",
        entity_id=entity_id,
        old_value=json.dumps(old_value) if old_value is not None else None,
        new_value=json.dumps(new_value) if new_value is not None else None,
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return log
