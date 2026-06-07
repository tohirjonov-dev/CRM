from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_
from app.models.order import Order
from app.models.product import Product
from app.models.client import Client
from app.schemas.stats import DashboardStatsResponse, SalesChartPoint, InventoryDistributionPoint
from datetime import datetime, timedelta
from app.models.order import OrderItem

async def get_dashboard_stats(db: AsyncSession) -> DashboardStatsResponse:
    # 1. Total Revenue (exclude Cancelled)
    rev_result = await db.execute(
        select(func.sum(Order.total_amount))
        .filter(Order.status != "Cancelled")
    )
    total_rev = rev_result.scalar() or 0.0

    # 2. Pending Orders (Pending & Processing)
    pending_result = await db.execute(
        select(func.count(Order.id))
        .filter(Order.status.in_(["Pending", "Processing"]))
    )
    pending_count = pending_result.scalar() or 0

    # 3. Low stock alerts (stock_quantity <= min_stock_level)
    low_stock_result = await db.execute(
        select(func.count(Product.id))
        .filter(Product.stock_quantity <= Product.min_stock_level)
    )
    low_stock_count = low_stock_result.scalar() or 0

    # 4. Active B2B clients
    clients_result = await db.execute(
        select(func.count(Client.id))
        .filter(Client.is_active == True)
    )
    clients_count = clients_result.scalar() or 0

    # Oxirgi 7 kun vs oldingi 7 kun daromad o'sishi (%)
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)
    recent_rev = await db.execute(
        select(func.sum(Order.total_amount)).filter(
            Order.status != "Cancelled",
            Order.order_date >= week_ago,
        )
    )
    prev_rev = await db.execute(
        select(func.sum(Order.total_amount)).filter(
            Order.status != "Cancelled",
            Order.order_date >= two_weeks_ago,
            Order.order_date < week_ago,
        )
    )
    recent = float(recent_rev.scalar() or 0)
    previous = float(prev_rev.scalar() or 0)
    if previous > 0:
        revenue_trend = round(((recent - previous) / previous) * 100, 1)
    elif recent > 0:
        revenue_trend = 100.0
    else:
        revenue_trend = 0.0

    return DashboardStatsResponse(
        total_revenue=float(total_rev),
        pending_orders=int(pending_count),
        low_stock_alerts=int(low_stock_count),
        active_clients=int(clients_count),
        revenue_trend=revenue_trend
    )

async def get_sales_chart_data(db: AsyncSession, days: int = 30) -> list[SalesChartPoint]:
    # Group by date and calculate sales and count
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    result = await db.execute(
        select(
            func.date(Order.order_date).label("date"),
            func.sum(Order.total_amount).label("sales"),
            func.count(Order.id).label("orders")
        )
        .filter(and_(Order.order_date >= start_date, Order.status != "Cancelled"))
        .group_by(func.date(Order.order_date))
        .order_by(func.date(Order.order_date))
    )
    
    rows = result.all()
    db_data = {str(row.date): (float(row.sales or 0), int(row.orders or 0)) for row in rows}
    
    chart_points = []
    # Fill in missing dates to make a continuous chart
    for i in range(days):
        current_day = start_date + timedelta(days=i)
        date_str = current_day.strftime("%Y-%m-%d")
        
        if date_str in db_data:
            sales, orders = db_data[date_str]
        else:
            sales, orders = 0.0, 0

        chart_points.append(
            SalesChartPoint(
                date=date_str,
                sales=sales,
                orders=orders
            )
        )
        
    return chart_points

async def get_inventory_distribution(db: AsyncSession) -> list[InventoryDistributionPoint]:
    result = await db.execute(
        select(
            Product.category,
            func.sum(Product.stock_quantity).label("count")
        )
        .group_by(Product.category)
    )
    rows = result.all()
    
    # Ensure all default categories are represented
    categories = {"Men's": 0, "Women's": 0, "Kids": 0, "Accessories": 0}
    for row in rows:
        if row.category in categories:
            categories[row.category] = int(row.count or 0)
            
    return [
        InventoryDistributionPoint(category=cat, count=cnt)
        for cat, cnt in categories.items()
        if cnt > 0
    ]


async def get_top_clients(db: AsyncSession, limit: int = 5) -> list[dict]:
    result = await db.execute(
        select(
            Client.company_name.label("name"),
            func.count(Order.id).label("orders"),
            func.coalesce(func.sum(Order.total_amount), 0).label("revenue"),
        )
        .join(Order, Order.client_id == Client.id)
        .filter(Order.status != "Cancelled")
        .group_by(Client.id, Client.company_name)
        .order_by(func.sum(Order.total_amount).desc())
        .limit(limit)
    )
    return [
        {"name": row.name, "orders": int(row.orders or 0), "revenue": float(row.revenue or 0)}
        for row in result.all()
    ]


async def get_top_products(db: AsyncSession, limit: int = 5) -> list[dict]:
    result = await db.execute(
        select(
            Product.name.label("name"),
            func.coalesce(func.sum(OrderItem.quantity), 0).label("sales"),
            func.coalesce(func.sum(OrderItem.quantity * OrderItem.unit_price), 0).label("revenue"),
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.status != "Cancelled")
        .group_by(Product.id, Product.name)
        .order_by(func.sum(OrderItem.quantity * OrderItem.unit_price).desc())
        .limit(limit)
    )
    return [
        {"name": row.name, "sales": int(row.sales or 0), "revenue": float(row.revenue or 0)}
        for row in result.all()
    ]
