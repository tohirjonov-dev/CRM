"""Namuna (demo) ma'lumotlarni bazadan o'chirish.

Ishlatish (loyiha ildizidan):
  docker compose exec backend python -m scripts.purge_demo_data
"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import SessionLocal
from app.services.seed_db import purge_business_data


async def main() -> None:
    async with SessionLocal() as db:
        counts = await purge_business_data(db)
    print("O'chirildi:")
    for table, n in counts.items():
        print(f"  - {table}: {n} ta yozuv")


if __name__ == "__main__":
    asyncio.run(main())
