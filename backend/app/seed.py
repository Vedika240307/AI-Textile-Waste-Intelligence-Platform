"""
Seeds four demo accounts (one per role) so the platform is demo-able immediately
after `docker compose up`. Run automatically on container start (see Dockerfile/CMD),
or manually with: python -m app.seed
"""
from .database import SessionLocal, Base, engine
from . import models
from .security import hash_password

DEMO_PASSWORD = "Password123!"

DEMO_USERS = [
    dict(name="Admin User", email="admin@textilewaste.com", organization="Circular Systems HQ",
         role=models.RoleEnum.admin),
    dict(name="Manufacturer User", email="manufacturer@textilewaste.com", organization="Nova Fabrics Ltd",
         role=models.RoleEnum.manufacturer),
    dict(name="Operator User", email="operator@textilewaste.com", organization="GreenLoop Recycling",
         role=models.RoleEnum.operator),
    dict(name="Analyst User", email="analyst@textilewaste.com", organization="EcoMetrics Analytics",
         role=models.RoleEnum.analyst),
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for u in DEMO_USERS:
            existing = db.query(models.User).filter(models.User.email == u["email"]).first()
            if existing:
                continue
            db.add(models.User(
                name=u["name"],
                email=u["email"],
                password_hash=hash_password(DEMO_PASSWORD),
                organization=u["organization"],
                role=u["role"],
            ))
        db.commit()
        print(f"Seed complete. Demo password for all accounts: {DEMO_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
