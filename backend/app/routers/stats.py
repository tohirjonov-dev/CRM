from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.stats import (
    DashboardStatsResponse,
    SalesChartPoint,
    InventoryDistributionPoint,
    TopClientPoint,
    TopProductPoint,
)
from app.services.stats_service import (
    get_dashboard_stats,
    get_sales_chart_data,
    get_inventory_distribution,
    get_top_clients,
    get_top_products,
)
from app.utils.dependencies import get_current_active_user
from app.models.user import User
from typing import List

router = APIRouter(prefix="/api/stats", tags=["Dashboard Statistics"])

@router.get("/dashboard", response_model=DashboardStatsResponse)
async def get_dashboard_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await get_dashboard_stats(db)

@router.get("/sales-chart", response_model=List[SalesChartPoint])
async def get_sales_chart(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await get_sales_chart_data(db, days)

@router.get("/inventory-distribution", response_model=List[InventoryDistributionPoint])
async def get_inv_distribution(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await get_inventory_distribution(db)

@router.get("/top-clients", response_model=List[TopClientPoint])
async def top_clients(
    limit: int = Query(5, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return await get_top_clients(db, limit)

@router.get("/top-products", response_model=List[TopProductPoint])
async def top_products(
    limit: int = Query(5, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return await get_top_products(db, limit)
