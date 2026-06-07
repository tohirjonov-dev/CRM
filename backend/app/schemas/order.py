from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from app.schemas.client import ClientResponse
from app.schemas.product import ProductResponse

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    client_id: int
    items: List[OrderItemCreate]

class OrderUpdateStatus(BaseModel):
    status: str = Field(..., description="Pending, Processing, Shipped, Delivered, or Cancelled")

class OrderResponse(BaseModel):
    id: int
    order_number: str
    client_id: int
    status: str
    total_amount: float
    items_count: int
    order_date: datetime
    created_at: datetime
    client: Optional[ClientResponse] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True
# Basic list view response that avoids deep recursion of items for lightweight endpoints
class OrderListResponse(BaseModel):
    id: int
    order_number: str
    client_id: int
    status: str
    total_amount: float
    items_count: int
    order_date: datetime
    client_company_name: Optional[str] = None

    class Config:
        from_attributes = True
