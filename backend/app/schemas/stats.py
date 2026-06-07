from pydantic import BaseModel
from typing import List

class DashboardStatsResponse(BaseModel):
    total_revenue: float
    pending_orders: int
    low_stock_alerts: int
    active_clients: int
    revenue_trend: float

class SalesChartPoint(BaseModel):
    date: str
    sales: float
    orders: int

class InventoryDistributionPoint(BaseModel):
    category: str
    count: int

class TopClientPoint(BaseModel):
    name: str
    orders: int
    revenue: float

class TopProductPoint(BaseModel):
    name: str
    sales: int
    revenue: float
