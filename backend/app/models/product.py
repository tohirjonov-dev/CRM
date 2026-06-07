from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False) # "Men's", "Women's", "Kids", "Accessories"
    price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, nullable=False)
    min_stock_level = Column(Integer, default=10)
    supplier_id = Column(String, nullable=True) # Or integer if linked to an actual supplier entity, but text is fine as per requirements
    created_at = Column(DateTime(timezone=True), server_default=func.now())
