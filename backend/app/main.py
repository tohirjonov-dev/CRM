from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
import time

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.services.seed_db import seed_data
from app.routers import auth, products, clients, orders, stats, suppliers

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize Database Tables if they don't exist
    async with engine.begin() as conn:
        # Create all tables (users, products, clients, orders, order_items)
        await conn.run_sync(Base.metadata.create_all)
    
    # 2. Faqat standart loginlar (namuna ma'lumot yo'q)
    async with SessionLocal() as db_session:
        try:
            await seed_data(db_session)
        except Exception as e:
            print(f"Error seeding database: {e}")
            
    yield
    # 3. Clean up connections on shutdown
    await engine.dispose()

app = FastAPI(
    title="Apparel Cloud API",
    description="Production-Ready ERP/CRM/WMS Management Backend for BTEC Unit 6 Cloud Networking Assignment.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(clients.router)
app.include_router(orders.router)
app.include_router(stats.router)
app.include_router(suppliers.router)

# Health Check Route
@app.get("/health", tags=["System Health"])
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "uptime_epoch": time.time()
    }
