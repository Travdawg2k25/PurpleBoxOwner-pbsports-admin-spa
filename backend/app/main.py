"""
Purple Box Sports API
=====================
FastAPI backend for auth, packages, coupons, payments, and game processing.
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import ADMIN_EMAIL, ADMIN_PASSWORD, CORS_ORIGINS
from app.database import create_tables, database, users, packages
from app.auth import hash_password
from app.routers import auth_router, packages_router, checkout_router, games_router, recruiting_router

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("PBSports.API")

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Purple Box Sports API",
    version="1.0.0",
    description="Auth, packages, coupons, payments, and game processing",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router.router, prefix="/api")
app.include_router(packages_router.router, prefix="/api")
app.include_router(checkout_router.router, prefix="/api")
app.include_router(games_router.router, prefix="/api")
app.include_router(games_router.internal, prefix="/api")
app.include_router(recruiting_router.router, prefix="/api")


# ── Lifecycle ─────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    # Create tables
    create_tables()
    logger.info("Database tables created/verified.")

    # Connect async database
    await database.connect()
    logger.info("Database connected.")

    # Seed admin user if not exists
    admin = await database.fetch_one(
        users.select().where(users.c.email == ADMIN_EMAIL)
    )
    if not admin:
        await database.execute(
            users.insert().values(
                email=ADMIN_EMAIL,
                hashed_password=hash_password(ADMIN_PASSWORD),
                full_name="Admin",
                is_admin=True,
                is_active=True,
                games_remaining=9999,
            )
        )
        logger.info("Admin user created: %s", ADMIN_EMAIL)

    # Seed default packages if none exist
    pkg_rows = await database.fetch_all(packages.select())
    if len(pkg_rows) == 0:
        default_packages = [
            {"name": "Starter", "games_included": 5, "price_cents": 19900, "sort_order": 1, "description": "5 game analyses", "is_active": True},
            {"name": "Pro", "games_included": 10, "price_cents": 34900, "sort_order": 2, "description": "10 game analyses — best value", "is_active": True},
            {"name": "Elite", "games_included": 15, "price_cents": 54900, "sort_order": 3, "description": "15 game analyses for the serious athlete", "is_active": True},
        ]
        for pkg in default_packages:
            await database.execute(
                packages.insert().values(**pkg)
            )
        logger.info("Default packages seeded: Starter, Pro, Elite")

    logger.info("Purple Box Sports API ready.")


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()
    logger.info("Database disconnected.")


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "Purple Box Sports API"}


@app.get("/")
async def root():
    return {"message": "Purple Box Sports API v1.0.0", "docs": "/docs"}
