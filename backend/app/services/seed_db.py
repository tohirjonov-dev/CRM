from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, delete
from app.models.user import User
from app.models.product import Product
from app.models.client import Client
from app.models.supplier import Supplier
from app.models.order import Order, OrderItem
from app.utils.security import get_password_hash


async def purge_business_data(db: AsyncSession) -> dict[str, int]:
    """Barcha biznes ma'lumotlarini o'chiradi (foydalanuvchilar saqlanadi)."""
    counts: dict[str, int] = {}

    r = await db.execute(delete(OrderItem))
    counts["order_items"] = r.rowcount or 0

    r = await db.execute(delete(Order))
    counts["orders"] = r.rowcount or 0

    r = await db.execute(delete(Product))
    counts["products"] = r.rowcount or 0

    r = await db.execute(delete(Client))
    counts["clients"] = r.rowcount or 0

    r = await db.execute(delete(Supplier))
    counts["suppliers"] = r.rowcount or 0

    await db.commit()
    return counts


async def seed_default_users(db: AsyncSession) -> None:
    """Faqat standart admin/xodim hisoblarini yaratadi (namuna ma'lumot yo'q)."""
    result_users = await db.execute(select(func.count(User.id)))
    user_count = result_users.scalar()

    if user_count == 0:
        admin_user = User(
            email="admin@apparelcloud.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Administrator",
            role="admin",
            is_active=True,
        )
        staff_user = User(
            email="staff@apparelcloud.com",
            hashed_password=get_password_hash("staffpassword"),
            full_name="Xodim",
            role="staff",
            is_active=True,
        )
        db.add_all([admin_user, staff_user])
        await db.commit()
        print("Standart foydalanuvchilar yaratildi: admin@apparelcloud.com / staff@apparelcloud.com")


async def seed_data(db: AsyncSession) -> None:
    """Ishga tushganda faqat jadval va kerak bo'lsa default loginlarni ta'minlaydi."""
    await seed_default_users(db)
