from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_
from app.database import get_db
from app.models.product import Product
from app.models.user import User  # ⬅️ BU YERGA KO'CHIRILDI (eng yuqoriga)
from app.schemas.product import ProductResponse, ProductCreate, ProductUpdate
from app.utils.dependencies import get_current_active_user
from typing import List, Optional
from pydantic import BaseModel


router = APIRouter(prefix="/api/products", tags=["WMS - Products"])

class ProductPagination(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    limit: int

@router.get("", response_model=ProductPagination)
async def get_products(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    category: Optional[str] = None,
    stock_status: Optional[str] = Query(None, description="low, normal, out_of_stock"),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = select(Product)
    filters = []

    if category:
        filters.append(Product.category == category)
    
    if stock_status == "low":
        filters.append(Product.stock_quantity <= Product.min_stock_level)
    elif stock_status == "out_of_stock":
        filters.append(Product.stock_quantity == 0)
    elif stock_status == "normal":
        filters.append(Product.stock_quantity > Product.min_stock_level)

    if search:
        filters.append(Product.name.ilike(f"%{search}%") | Product.sku.ilike(f"%{search}%"))

    if filters:
        query = query.filter(and_(*filters))

    # Count total query
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    query = query.order_by(Product.id.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    products = result.scalars().all()

    return ProductPagination(
        items=list(products),
        total=total,
        page=page,
        limit=limit
    )

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(Product).filter(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if SKU already exists
    sku_check = await db.execute(select(Product).filter(Product.sku == product_in.sku))
    if sku_check.scalars().first():
        raise HTTPException(status_code=400, detail="Bu SKU kodi allaqachon mavjud")

    product = Product(**product_in.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(Product).filter(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    await db.commit()
    await db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(Product).filter(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    await db.delete(product)
    await db.commit()
    return None