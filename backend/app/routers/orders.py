from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.client import Client
from app.schemas.order import OrderResponse, OrderCreate, OrderUpdateStatus, OrderListResponse
from app.utils.dependencies import get_current_active_user
from app.models.user import User
from typing import List, Optional
from datetime import datetime
import random
from pydantic import BaseModel

router = APIRouter(prefix="/api/orders", tags=["CRM - Orders"])

class OrderPagination(BaseModel):
    items: List[OrderResponse]
    total: int
    page: int
    limit: int

@router.get("", response_model=OrderPagination)
async def get_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    client_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = select(Order).options(
        selectinload(Order.client),
        selectinload(Order.items).selectinload(OrderItem.product)
    )
    filters = []

    if status:
        filters.append(Order.status == status)
    
    if client_id:
        filters.append(Order.client_id == client_id)

    if start_date:
        filters.append(Order.order_date >= start_date)
    
    if end_date:
        filters.append(Order.order_date <= end_date)

    if filters:
        query = query.filter(and_(*filters))

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    query = query.order_by(Order.order_date.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    orders = result.scalars().all()

    return OrderPagination(
        items=list(orders),
        total=total,
        page=page,
        limit=limit
    )

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = select(Order).filter(Order.id == order_id).options(
        selectinload(Order.client),
        selectinload(Order.items).selectinload(OrderItem.product)
    )
    result = await db.execute(query)
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify client exists
    client_check = await db.execute(select(Client).filter(Client.id == order_in.client_id))
    client = client_check.scalars().first()
    if not client:
        raise HTTPException(status_code=400, detail="Client does not exist")

    # Generate unique order number
    count_query = select(func.count(Order.id))
    order_count_result = await db.execute(count_query)
    order_count = order_count_result.scalar() or 0
    order_num = f"#WH-{9000 + order_count + random.randint(1, 9)}"

    # Create Order
    order = Order(
        order_number=order_num,
        client_id=order_in.client_id,
        status="Pending",
        total_amount=0.0,
        items_count=0
    )
    db.add(order)
    await db.flush() # Populate order.id

    total_amount = 0.0
    items_count = 0

    for item in order_in.items:
        # Get product
        prod_check = await db.execute(select(Product).filter(Product.id == item.product_id))
        product = prod_check.scalars().first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with ID {item.product_id} not found")

        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock for product '{product.name}'. Available: {product.stock_quantity}, requested: {item.quantity}"
            )

        # Deduct stock
        product.stock_quantity -= item.quantity

        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=product.price
        )
        db.add(order_item)

        total_amount += item.quantity * product.price
        items_count += item.quantity

    order.total_amount = round(total_amount, 2)
    order.items_count = items_count

    await db.commit()
    
    # Reload with relationships loaded
    query = select(Order).filter(Order.id == order.id).options(
        selectinload(Order.client),
        selectinload(Order.items).selectinload(OrderItem.product)
    )
    result = await db.execute(query)
    return result.scalars().first()

@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    status_in: OrderUpdateStatus,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = select(Order).filter(Order.id == order_id).options(
        selectinload(Order.client),
        selectinload(Order.items).selectinload(OrderItem.product)
    )
    result = await db.execute(query)
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    valid_statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]
    if status_in.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    # If status changes to Cancelled, return inventory stock
    if status_in.status == "Cancelled" and order.status != "Cancelled":
        for item in order.items:
            result_prod = await db.execute(select(Product).filter(Product.id == item.product_id))
            product = result_prod.scalars().first()
            if product:
                product.stock_quantity += item.quantity
                
    # If status moves from Cancelled back to something else, deduct stock again
    elif order.status == "Cancelled" and status_in.status != "Cancelled":
        for item in order.items:
            result_prod = await db.execute(select(Product).filter(Product.id == item.product_id))
            product = result_prod.scalars().first()
            if product:
                if product.stock_quantity < item.quantity:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Cannot un-cancel order. Insufficient stock for product '{product.name}'."
                    )
                product.stock_quantity -= item.quantity

    order.status = status_in.status
    await db.commit()
    await db.refresh(order)
    return order
