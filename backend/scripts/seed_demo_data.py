"""Namuna ma'lumotlarni qayta yuklash (ixtiyoriy).

  docker compose exec backend python scripts/seed_demo_data.py
"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import SessionLocal
from app.services.seed_demo_data import seed_demo_business_data


async def main() -> None:
    async with SessionLocal() as db:
        counts = await seed_demo_business_data(db)
    print("Yuklandi (faqat bo'sh jadvallarga):")
    for key, n in counts.items():
        if n:
            print(f"  - {key}: {n}")


if __name__ == "__main__":
    asyncio.run(main())
