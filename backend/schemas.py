from typing import Literal

from pydantic import BaseModel


Department = Literal[
    "Backend",
    "Frontend",
    "Other",
]


class EmployeeCreate(BaseModel):
    id: str
    name: str
    department: Department
    salary: int


class EmployeeResponse(BaseModel):
    id: str
    name: str
    department: str
    salary: int

    class Config:
        from_attributes = True
