from pydantic import BaseModel


class EmployeeCreate(BaseModel):
    id: str
    name: str
    department: str
    salary: int


class EmployeeResponse(BaseModel):
    id: str
    name: str
    department: str
    salary: int

    class Config:
        from_attributes = True