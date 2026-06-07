from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.database import get_db
from app.models.client import Client
from app.schemas.client import ClientResponse, ClientCreate
from app.utils.dependencies import get_current_active_user
from app.models.user import User
from typing import List, Optional

router = APIRouter(prefix="/api/clients", tags=["CRM - Clients"])

@router.get("", response_model=List[ClientResponse])
async def get_clients(
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = select(Client)
    if search:
        query = query.filter(
            Client.company_name.ilike(f"%{search}%") | 
            Client.contact_person.ilike(f"%{search}%") |
            Client.email.ilike(f"%{search}%")
        )
    
    query = query.order_by(Client.company_name.asc())
    result = await db.execute(query)
    clients = result.scalars().all()
    return list(clients)

@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(
    client_in: ClientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if company_name or email already exists
    name_check = await db.execute(select(Client).filter(Client.company_name == client_in.company_name))
    if name_check.scalars().first():
        raise HTTPException(status_code=400, detail="Bu kompaniya nomi allaqachon mavjud")

    email_check = await db.execute(select(Client).filter(Client.email == client_in.email))
    if email_check.scalars().first():
        raise HTTPException(status_code=400, detail="Bu email allaqachon ro'yxatdan o'tgan")

    client = Client(**client_in.model_dump())
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client
