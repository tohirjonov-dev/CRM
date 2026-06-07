"""Ixtiyoriy namuna (demo) ma'lumotlar — faqat `scripts/seed_demo_data.py` orqali yuklanadi."""
import random
from datetime import datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.models.product import Product
from app.models.client import Client
from app.models.supplier import Supplier
from app.models.order import Order, OrderItem


async def seed_demo_business_data(db: AsyncSession) -> dict[str, int]:
    """Bo'sh jadvallarga namuna ma'lumot qo'shadi (mavjud yozuvlarni o'chirmaydi)."""
    created: dict[str, int] = {
        "clients": 0,
        "suppliers": 0,
        "products": 0,
        "orders": 0,
    }

    clients_list: list[Client] = []
    result_clients = await db.execute(select(func.count(Client.id)))
    if (result_clients.scalar() or 0) == 0:
        company_names = [
            "Fashion Hub Ltd",
            "Style Distributors",
            "Urban Wear Co",
            "Elite Boutique",
            "Global Trends Inc",
        ]
        contact_people = ["John Doe", "Jane Smith", "Robert Johnson", "Emily Davis", "Michael Brown"]
        for i, company in enumerate(company_names):
            client = Client(
                company_name=company,
                contact_person=contact_people[i],
                email=f"info@{company.lower().replace(' ', '')}.com",
                phone=f"+99890123{i:04d}",
                address=f"Toshkent sh., {100 + i}-uy",
                is_active=True,
            )
            db.add(client)
            clients_list.append(client)
        await db.commit()
        for client in clients_list:
            await db.refresh(client)
        created["clients"] = len(clients_list)
    else:
        result = await db.execute(select(Client))
        clients_list = list(result.scalars().all())

    result_suppliers = await db.execute(select(func.count(Supplier.id)))
    if (result_suppliers.scalar() or 0) == 0:
        suppliers_data = [
            ("SUP-101", "Toshkent Tekstil Zavodi", "Karimov Sardor", "sardor@ttz.uz", "+998901112233", "O'zbekiston"),
            ("SUP-102", "Farg'ona Ipak Fabrikasi", "Rahimova Nilufar", "nilufar@ipak.uz", "+998903334455", "O'zbekiston"),
            ("SUP-103", "Global Denim Export", "James Miller", "james@globaldenim.com", "+1-555-0101", "AQSh"),
        ]
        for code, name, contact, email, phone, country in suppliers_data:
            db.add(
                Supplier(
                    code=code,
                    name=name,
                    contact_person=contact,
                    email=email,
                    phone=phone,
                    country=country,
                    is_active=True,
                )
            )
        await db.commit()
        created["suppliers"] = len(suppliers_data)

    products_list: list[Product] = []
    result_products = await db.execute(select(func.count(Product.id)))
    if (result_products.scalar() or 0) == 0:
        product_templates = [
            ("Men's", "Slim Fit Denim Jeans", 45.0, "M-DNM-SLM"),
            ("Men's", "Classic Oxford Shirt", 35.0, "M-SHR-OXF"),
            ("Women's", "Boho Floral Maxi Dress", 59.99, "W-DRS-FLR"),
            ("Women's", "High-Waist Skinny Jeans", 49.99, "W-DNM-SKN"),
            ("Kids", "Unicorn Cotton Pajamas", 18.0, "K-PJM-UNI"),
            ("Accessories", "Leather Dress Belt", 24.99, "A-BLT-LTH"),
        ]
        for cat, name, price, sku_prefix in product_templates:
            product = Product(
                sku=f"{sku_prefix}-{random.randint(1000, 9999)}",
                name=name,
                category=cat,
                price=price,
                stock_quantity=random.randint(50, 200),
                min_stock_level=10,
                supplier_id="SUP-101",
            )
            db.add(product)
            products_list.append(product)
        await db.commit()
        for product in products_list:
            await db.refresh(product)
        created["products"] = len(products_list)
    else:
        result = await db.execute(select(Product))
        products_list = list(result.scalars().all())

    result_orders = await db.execute(select(func.count(Order.id)))
    if (result_orders.scalar() or 0) == 0 and clients_list and products_list:
        statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]
        status_weights = [0.15, 0.25, 0.25, 0.30, 0.05]
        now = datetime.utcnow()
        for i in range(15):
            client = random.choice(clients_list)
            status = random.choices(statuses, weights=status_weights)[0]
            order_date = now - timedelta(days=random.randint(0, 14))
            order = Order(
                order_number=f"#WH-{9000 + i}",
                client_id=client.id,
                status=status,
                total_amount=0.0,
                items_count=0,
                order_date=order_date,
                created_at=order_date,
            )
            db.add(order)
            await db.flush()
            prod = random.choice(products_list)
            qty = random.randint(5, 30)
            db.add(
                OrderItem(
                    order_id=order.id,
                    product_id=prod.id,
                    quantity=qty,
                    unit_price=prod.price,
                )
            )
            order.total_amount = round(qty * prod.price, 2)
            order.items_count = qty
        await db.commit()
        created["orders"] = 15

    return created
