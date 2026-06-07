from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ProductBase(BaseModel):
    sku: str = Field(..., description="Unique Stock Keeping Unit code")
    name: str
    category: str = Field(..., description="Men's, Women's, Kids, or Accessories")
    price: float = Field(..., gt=0)
    stock_quantity: int = Field(..., ge=0)
    min_stock_level: int = Field(default=10, ge=0)
    supplier_id: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    stock_quantity: Optional[int] = None
    min_stock_level: Optional[int] = None
    supplier_id: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
