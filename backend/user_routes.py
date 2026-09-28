from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from auth_routes import require_admin
from auth_utils import hash_password
from database import SessionLocal
from user_model import User


router = APIRouter(
    prefix="/users",
    tags=["User Management"],
)


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "viewer"


class UserUpdate(BaseModel):
    username: str
    email: EmailStr
    role: str


class PasswordReset(BaseModel):
    password: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def validate_role(role: str):
    if role not in {"admin", "viewer"}:
        raise HTTPException(
            status_code=400,
            detail="Role must be admin or viewer",
        )


@router.get("", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return db.query(User).order_by(User.id).all()


@router.post("", response_model=UserResponse)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    validate_role(data.role)

    existing_username = (
        db.query(User)
        .filter(User.username == data.username)
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists",
        )

    existing_email = (
        db.query(User)
        .filter(User.email == str(data.email))
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists",
        )

    user = User(
        username=data.username,
        email=str(data.email),
        password_hash=hash_password(data.password),
        role=data.role,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    validate_role(data.role)

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    username_exists = (
        db.query(User)
        .filter(
            User.username == data.username,
            User.id != user_id,
        )
        .first()
    )

    if username_exists:
        raise HTTPException(
            status_code=400,
            detail="Username already exists",
        )

    email_exists = (
        db.query(User)
        .filter(
            User.email == str(data.email),
            User.id != user_id,
        )
        .first()
    )

    if email_exists:
        raise HTTPException(
            status_code=400,
            detail="Email already exists",
        )

    if user.role == "admin" and data.role == "viewer":
        admin_count = (
            db.query(User)
            .filter(User.role == "admin")
            .count()
        )

        if admin_count <= 1:
            raise HTTPException(
                status_code=400,
                detail="Cannot remove the last admin",
            )

    user.username = data.username
    user.email = str(data.email)
    user.role = data.role

    db.commit()
    db.refresh(user)

    return user


@router.put("/{user_id}/password")
def reset_password(
    user_id: int,
    data: PasswordReset,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if len(data.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters",
        )

    user.password_hash = hash_password(data.password)

    db.commit()

    return {
        "message": "Password reset successfully",
    }


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account",
        )

    if user.role == "admin":
        admin_count = (
            db.query(User)
            .filter(User.role == "admin")
            .count()
        )

        if admin_count <= 1:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete the last admin",
            )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully",
    }
