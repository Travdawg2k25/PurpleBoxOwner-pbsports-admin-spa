"""Database setup using SQLAlchemy + async databases."""

import sqlalchemy
from databases import Database

from app.config import DATABASE_URL

# Async database connection (for queries)
database = Database(DATABASE_URL)

# SQLAlchemy metadata (for table definitions)
metadata = sqlalchemy.MetaData()

# ═════════════════════════════════════════════════════════════════════════════
# TABLE DEFINITIONS
# ═════════════════════════════════════════════════════════════════════════════

users = sqlalchemy.Table(
    "users",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True, autoincrement=True),
    sqlalchemy.Column("email", sqlalchemy.String(255), unique=True, nullable=False, index=True),
    sqlalchemy.Column("hashed_password", sqlalchemy.String(255), nullable=False),
    sqlalchemy.Column("full_name", sqlalchemy.String(255), nullable=True),
    sqlalchemy.Column("phone", sqlalchemy.String(50), nullable=True),
    sqlalchemy.Column("is_admin", sqlalchemy.Boolean, default=False),
    sqlalchemy.Column("is_active", sqlalchemy.Boolean, default=True),
    sqlalchemy.Column("games_remaining", sqlalchemy.Integer, default=0),
    sqlalchemy.Column("stripe_customer_id", sqlalchemy.String(255), nullable=True),
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, server_default=sqlalchemy.func.now()),
    sqlalchemy.Column("updated_at", sqlalchemy.DateTime, server_default=sqlalchemy.func.now(), onupdate=sqlalchemy.func.now()),
)

packages = sqlalchemy.Table(
    "packages",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True, autoincrement=True),
    sqlalchemy.Column("name", sqlalchemy.String(100), nullable=False),
    sqlalchemy.Column("games_included", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("price_cents", sqlalchemy.Integer, nullable=False),  # $199 = 19900
    sqlalchemy.Column("stripe_price_id", sqlalchemy.String(255), nullable=True),
    sqlalchemy.Column("is_active", sqlalchemy.Boolean, default=True),
    sqlalchemy.Column("sort_order", sqlalchemy.Integer, default=0),
    sqlalchemy.Column("description", sqlalchemy.Text, nullable=True),
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, server_default=sqlalchemy.func.now()),
)

coupons = sqlalchemy.Table(
    "coupons",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True, autoincrement=True),
    sqlalchemy.Column("code", sqlalchemy.String(50), unique=True, nullable=False, index=True),
    sqlalchemy.Column("discount_type", sqlalchemy.String(20), nullable=False),  # percent, fixed, free
    sqlalchemy.Column("discount_value", sqlalchemy.Integer, default=0),  # percent (0-100) or cents
    sqlalchemy.Column("max_uses", sqlalchemy.Integer, nullable=True),  # null = unlimited
    sqlalchemy.Column("times_used", sqlalchemy.Integer, default=0),
    sqlalchemy.Column("expires_at", sqlalchemy.DateTime, nullable=True),
    sqlalchemy.Column("is_active", sqlalchemy.Boolean, default=True),
    sqlalchemy.Column("created_by", sqlalchemy.Integer, sqlalchemy.ForeignKey("users.id"), nullable=True),
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, server_default=sqlalchemy.func.now()),
)

purchases = sqlalchemy.Table(
    "purchases",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True, autoincrement=True),
    sqlalchemy.Column("user_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("users.id"), nullable=False),
    sqlalchemy.Column("package_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("packages.id"), nullable=False),
    sqlalchemy.Column("coupon_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("coupons.id"), nullable=True),
    sqlalchemy.Column("amount_paid_cents", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("games_added", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("stripe_session_id", sqlalchemy.String(255), nullable=True),
    sqlalchemy.Column("stripe_payment_intent", sqlalchemy.String(255), nullable=True),
    sqlalchemy.Column("status", sqlalchemy.String(20), default="completed"),  # completed, refunded
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, server_default=sqlalchemy.func.now()),
)

game_uploads = sqlalchemy.Table(
    "game_uploads",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True, autoincrement=True),
    sqlalchemy.Column("user_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("users.id"), nullable=False),
    sqlalchemy.Column("job_id", sqlalchemy.String(100), unique=True, nullable=False, index=True),
    sqlalchemy.Column("video_key", sqlalchemy.String(500), nullable=True),
    sqlalchemy.Column("status", sqlalchemy.String(30), default="uploaded"),  # uploaded, detecting, selecting, analyzing, completed, failed
    sqlalchemy.Column("progress", sqlalchemy.Integer, default=0),
    sqlalchemy.Column("focus_track_id", sqlalchemy.Integer, nullable=True),
    sqlalchemy.Column("jersey_number", sqlalchemy.String(10), nullable=True),
    sqlalchemy.Column("player_name", sqlalchemy.String(255), nullable=True),
    sqlalchemy.Column("results_key", sqlalchemy.String(500), nullable=True),
    sqlalchemy.Column("error_message", sqlalchemy.Text, nullable=True),
    # Phase 3: link a processed game to a player profile (nullable).
    sqlalchemy.Column("player_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("players.id"), nullable=True),
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, server_default=sqlalchemy.func.now()),
    sqlalchemy.Column("completed_at", sqlalchemy.DateTime, nullable=True),
)


# ═════════════════════════════════════════════════════════════════════════════
# RECRUITING DOMAIN (Phase 3)
# ═════════════════════════════════════════════════════════════════════════════

sports = sqlalchemy.Table(
    "sports",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True, autoincrement=True),
    sqlalchemy.Column("name", sqlalchemy.String(100), nullable=False),
    sqlalchemy.Column("type", sqlalchemy.String(30), default="team"),  # team, individual, winter, combat, motor, other
    sqlalchemy.Column("is_active", sqlalchemy.Boolean, default=True),
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, server_default=sqlalchemy.func.now()),
)

colleges = sqlalchemy.Table(
    "colleges",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True, autoincrement=True),
    sqlalchemy.Column("name", sqlalchemy.String(255), nullable=False),
    sqlalchemy.Column("nickname", sqlalchemy.String(100), nullable=True),
    sqlalchemy.Column("abbreviation", sqlalchemy.String(10), nullable=True),
    sqlalchemy.Column("address", sqlalchemy.String(255), nullable=True),
    sqlalchemy.Column("city", sqlalchemy.String(100), nullable=True),
    sqlalchemy.Column("state", sqlalchemy.String(50), nullable=True),
    sqlalchemy.Column("zip", sqlalchemy.String(20), nullable=True),
    sqlalchemy.Column("email_ext", sqlalchemy.String(100), nullable=True),  # e.g. @school.edu
    sqlalchemy.Column("division", sqlalchemy.String(20), nullable=True),    # D1, D2, D3, NAIA, JUCO
    sqlalchemy.Column("is_active", sqlalchemy.Boolean, default=True),
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, server_default=sqlalchemy.func.now()),
)

players = sqlalchemy.Table(
    "players",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True, autoincrement=True),
    sqlalchemy.Column("owner_user_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("users.id"), nullable=False, index=True),
    sqlalchemy.Column("first_name", sqlalchemy.String(100), nullable=False),
    sqlalchemy.Column("last_name", sqlalchemy.String(100), nullable=True),
    sqlalchemy.Column("sport_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("sports.id"), nullable=True),
    sqlalchemy.Column("grad_year", sqlalchemy.Integer, nullable=True),
    sqlalchemy.Column("position", sqlalchemy.String(50), nullable=True),
    sqlalchemy.Column("jersey_number", sqlalchemy.String(10), nullable=True),
    sqlalchemy.Column("height_in", sqlalchemy.Integer, nullable=True),   # height in inches
    sqlalchemy.Column("weight_lb", sqlalchemy.Integer, nullable=True),
    sqlalchemy.Column("gpa", sqlalchemy.Float, nullable=True),
    sqlalchemy.Column("team_name", sqlalchemy.String(150), nullable=True),
    sqlalchemy.Column("city", sqlalchemy.String(100), nullable=True),
    sqlalchemy.Column("state", sqlalchemy.String(50), nullable=True),
    sqlalchemy.Column("highlight_url", sqlalchemy.String(500), nullable=True),
    sqlalchemy.Column("notes", sqlalchemy.Text, nullable=True),
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, server_default=sqlalchemy.func.now()),
    sqlalchemy.Column("updated_at", sqlalchemy.DateTime, server_default=sqlalchemy.func.now(), onupdate=sqlalchemy.func.now()),
)

coaches = sqlalchemy.Table(
    "coaches",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True, autoincrement=True),
    sqlalchemy.Column("name", sqlalchemy.String(255), nullable=False),
    sqlalchemy.Column("email", sqlalchemy.String(255), nullable=True),
    sqlalchemy.Column("phone", sqlalchemy.String(50), nullable=True),
    sqlalchemy.Column("type", sqlalchemy.String(30), default="college"),  # college, club, high_school
    sqlalchemy.Column("college_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("colleges.id"), nullable=True),
    sqlalchemy.Column("sport_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("sports.id"), nullable=True),
    sqlalchemy.Column("title", sqlalchemy.String(100), nullable=True),  # Head Coach, Assistant, Recruiting Coordinator
    sqlalchemy.Column("is_active", sqlalchemy.Boolean, default=True),
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, server_default=sqlalchemy.func.now()),
)


# ═════════════════════════════════════════════════════════════════════════════
# INIT
# ═════════════════════════════════════════════════════════════════════════════

def create_tables():
    """Create all tables (for SQLite, runs synchronously at startup)."""
    engine = sqlalchemy.create_engine(
        DATABASE_URL.replace("sqlite:///", "sqlite:///"),
        connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    )
    metadata.create_all(engine)
    engine.dispose()
