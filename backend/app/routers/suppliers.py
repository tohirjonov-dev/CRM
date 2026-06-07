from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from app.database import get_db
from app.models.supplier import Supplier
from app.models.user import User
from app.schemas.supplier import SupplierResponse, SupplierCreate, SupplierUpdate
from app.utils.dependencies import get_current_active_user

router = APIRouter(prefix="/api/suppliers", tags=["SRM - Ta'minotchilar"])


@router.get("", response_model=List[SupplierResponse])
async def get_suppliers(
    search: Optional[str] = None,
    active_only: bool = Query(True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = select(Supplier)
    if active_only:
        query = query.filter(Supplier.is_active.is_(True))
    if search:
        query = query.filter(
            Supplier.name.ilike(f"%{search}%")
            | Supplier.code.ilike(f"%{search}%")
            | Supplier.contact_person.ilike(f"%{search}%")
            | Supplier.email.ilike(f"%{search}%")
        )
    query = query.order_by(Supplier.name.asc())
    result = await db.execute(query)
    return list(result.scalars().all())


@router.post("", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
async def create_supplier(
    supplier_in: SupplierCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    code = supplier_in.code.strip().upper()
    code_check = await db.execute(select(Supplier).filter(Supplier.code == code))
    if code_check.scalars().first():
        raise HTTPException(status_code=400, detail="Bu ta'minotchi kodi allaqachon mavjud")

    email_check = await db.execute(select(Supplier).filter(Supplier.email == supplier_in.email))
    if email_check.scalars().first():
        raise HTTPException(status_code=400, detail="Bu email allaqachon ro'yxatdan o'tgan")

    supplier = Supplier(**supplier_in.model_dump())
    supplier.code = code
    db.add(supplier)
    await db.commit()
    await db.refresh(supplier)
    return supplier


@router.put("/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(
    supplier_id: int,
    supplier_in: SupplierUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(Supplier).filter(Supplier.id == supplier_id))
    supplier = result.scalars().first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Ta'minotchi topilmadi")

    update_data = supplier_in.model_dump(exclude_unset=True)
    if "email" in update_data and update_data["email"] != supplier.email:
        email_check = await db.execute(
            select(Supplier).filter(
                Supplier.email == update_data["email"],
                Supplier.id != supplier_id,
            )
        )
        if email_check.scalars().first():
            raise HTTPException(status_code=400, detail="Bu email boshqa ta'minotchida mavjud")

    for field, value in update_data.items():
        setattr(supplier, field, value)

    await db.commit()
    await db.refresh(supplier)
    return supplier


@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_supplier(
    supplier_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(Supplier).filter(Supplier.id == supplier_id))
    supplier = result.scalars().first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Ta'minotchi topilmadi")

    supplier.is_active = False
    await db.commit()
    return None
