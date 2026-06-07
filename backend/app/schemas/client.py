from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class ClientBase(BaseModel):
    company_name: str
    contact_person: str
    email: EmailStr
    phone: str
    address: str

class ClientCreate(ClientBase):
    pass

class ClientResponse(ClientBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
