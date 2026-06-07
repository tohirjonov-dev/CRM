from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class SupplierBase(BaseModel):
    code: str
    name: str
    contact_person: str
    email: EmailStr
    phone: str
    country: str = "O'zbekiston"


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    is_active: Optional[bool] = None


class SupplierResponse(SupplierBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
