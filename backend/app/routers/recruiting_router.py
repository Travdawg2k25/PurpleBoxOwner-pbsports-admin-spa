"""Recruiting domain routes (Phase 3) — sports, colleges, coaches, players.

All management endpoints are admin-gated. Players are owned by a user
(the parent/guardian; may be the user themselves) and can link to processed
game_uploads for stats/highlights.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth import get_admin_user
from app.database import (
    database,
    sports,
    colleges,
    coaches,
    players,
    users,
    game_uploads,
)

router = APIRouter(tags=["recruiting"])


# ═════════════════════════════════════════════════════════════════════════════
# SCHEMAS
# ═════════════════════════════════════════════════════════════════════════════
class SportCreate(BaseModel):
    name: str
    type: str = "team"


class SportUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    is_active: Optional[bool] = None


class CollegeCreate(BaseModel):
    name: str
    nickname: Optional[str] = None
    abbreviation: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None
    email_ext: Optional[str] = None
    division: Optional[str] = None


class CollegeUpdate(CollegeCreate):
    name: Optional[str] = None
    is_active: Optional[bool] = None


class CoachCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    type: str = "college"
    college_id: Optional[int] = None
    sport_id: Optional[int] = None
    title: Optional[str] = None


class CoachUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    type: Optional[str] = None
    college_id: Optional[int] = None
    sport_id: Optional[int] = None
    title: Optional[str] = None
    is_active: Optional[bool] = None


class PlayerCreate(BaseModel):
    owner_user_id: int
    first_name: str
    last_name: Optional[str] = None
    sport_id: Optional[int] = None
    grad_year: Optional[int] = None
    position: Optional[str] = None
    jersey_number: Optional[str] = None
    height_in: Optional[int] = None
    weight_lb: Optional[int] = None
    gpa: Optional[float] = None
    team_name: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    highlight_url: Optional[str] = None
    notes: Optional[str] = None


class PlayerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    sport_id: Optional[int] = None
    grad_year: Optional[int] = None
    position: Optional[str] = None
    jersey_number: Optional[str] = None
    height_in: Optional[int] = None
    weight_lb: Optional[int] = None
    gpa: Optional[float] = None
    team_name: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    highlight_url: Optional[str] = None
    notes: Optional[str] = None


# ═════════════════════════════════════════════════════════════════════════════
# SPORTS
# ═════════════════════════════════════════════════════════════════════════════
@router.get("/admin/sports")
async def list_sports(admin=Depends(get_admin_user)):
    rows = await database.fetch_all(sports.select().order_by(sports.c.name))
    return [dict(r._mapping) for r in rows]


@router.post("/admin/sports", status_code=201)
async def create_sport(req: SportCreate, admin=Depends(get_admin_user)):
    sid = await database.execute(
        sports.insert().values(name=req.name, type=req.type, is_active=True)
    )
    return {"id": sid, "message": "Sport created"}


@router.put("/admin/sports/{sport_id}")
async def update_sport(sport_id: int, req: SportUpdate, admin=Depends(get_admin_user)):
    updates = {k: v for k, v in req.dict().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    await database.execute(sports.update().where(sports.c.id == sport_id).values(**updates))
    return {"message": "Sport updated"}


@router.delete("/admin/sports/{sport_id}")
async def delete_sport(sport_id: int, admin=Depends(get_admin_user)):
    await database.execute(sports.update().where(sports.c.id == sport_id).values(is_active=False))
    return {"message": "Sport deactivated"}


# ═════════════════════════════════════════════════════════════════════════════
# COLLEGES
# ═════════════════════════════════════════════════════════════════════════════
@router.get("/admin/colleges")
async def list_colleges(admin=Depends(get_admin_user), search: str = ""):
    query = colleges.select().order_by(colleges.c.name)
    if search:
        query = query.where(colleges.c.name.ilike(f"%{search}%"))
    rows = await database.fetch_all(query)
    return [dict(r._mapping) for r in rows]


@router.post("/admin/colleges", status_code=201)
async def create_college(req: CollegeCreate, admin=Depends(get_admin_user)):
    cid = await database.execute(colleges.insert().values(is_active=True, **req.dict()))
    return {"id": cid, "message": "College created"}


@router.put("/admin/colleges/{college_id}")
async def update_college(college_id: int, req: CollegeUpdate, admin=Depends(get_admin_user)):
    updates = {k: v for k, v in req.dict().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    await database.execute(colleges.update().where(colleges.c.id == college_id).values(**updates))
    return {"message": "College updated"}


@router.delete("/admin/colleges/{college_id}")
async def delete_college(college_id: int, admin=Depends(get_admin_user)):
    await database.execute(colleges.update().where(colleges.c.id == college_id).values(is_active=False))
    return {"message": "College deactivated"}


# ═════════════════════════════════════════════════════════════════════════════
# COACHES
# ═════════════════════════════════════════════════════════════════════════════
@router.get("/admin/coaches")
async def list_coaches(admin=Depends(get_admin_user), search: str = "", type: str = ""):
    query = coaches.select().order_by(coaches.c.name)
    if search:
        query = query.where(coaches.c.name.ilike(f"%{search}%"))
    if type and type != "all":
        query = query.where(coaches.c.type == type)
    rows = await database.fetch_all(query)

    # Resolve college + sport names for display.
    college_map = {r["id"]: r["name"] for r in await database.fetch_all(colleges.select())}
    sport_map = {r["id"]: r["name"] for r in await database.fetch_all(sports.select())}

    result = []
    for r in rows:
        d = dict(r._mapping)
        d["college_name"] = college_map.get(d.get("college_id"))
        d["sport_name"] = sport_map.get(d.get("sport_id"))
        result.append(d)
    return result


@router.post("/admin/coaches", status_code=201)
async def create_coach(req: CoachCreate, admin=Depends(get_admin_user)):
    cid = await database.execute(coaches.insert().values(is_active=True, **req.dict()))
    return {"id": cid, "message": "Coach created"}


@router.put("/admin/coaches/{coach_id}")
async def update_coach(coach_id: int, req: CoachUpdate, admin=Depends(get_admin_user)):
    updates = {k: v for k, v in req.dict().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    await database.execute(coaches.update().where(coaches.c.id == coach_id).values(**updates))
    return {"message": "Coach updated"}


@router.delete("/admin/coaches/{coach_id}")
async def delete_coach(coach_id: int, admin=Depends(get_admin_user)):
    await database.execute(coaches.update().where(coaches.c.id == coach_id).values(is_active=False))
    return {"message": "Coach deactivated"}


# ═════════════════════════════════════════════════════════════════════════════
# PLAYERS
# ═════════════════════════════════════════════════════════════════════════════
def _player_dict(r, sport_map, owner_map):
    d = dict(r._mapping)
    d["sport_name"] = sport_map.get(d.get("sport_id"))
    d["owner_email"] = owner_map.get(d.get("owner_user_id"))
    return d


@router.get("/admin/players")
async def list_players(admin=Depends(get_admin_user), search: str = "", owner_user_id: Optional[int] = None):
    query = players.select().order_by(players.c.created_at.desc())
    if search:
        query = query.where(
            (players.c.first_name.ilike(f"%{search}%"))
            | (players.c.last_name.ilike(f"%{search}%"))
        )
    if owner_user_id is not None:
        query = query.where(players.c.owner_user_id == owner_user_id)
    rows = await database.fetch_all(query)

    sport_map = {r["id"]: r["name"] for r in await database.fetch_all(sports.select())}
    owner_map = {r["id"]: r["email"] for r in await database.fetch_all(users.select())}
    return [_player_dict(r, sport_map, owner_map) for r in rows]


@router.get("/admin/players/{player_id}")
async def get_player(player_id: int, admin=Depends(get_admin_user)):
    row = await database.fetch_one(players.select().where(players.c.id == player_id))
    if not row:
        raise HTTPException(status_code=404, detail="Player not found")

    sport_map = {r["id"]: r["name"] for r in await database.fetch_all(sports.select())}
    owner_map = {r["id"]: r["email"] for r in await database.fetch_all(users.select())}
    player = _player_dict(row, sport_map, owner_map)

    # Linked processed games (stats/highlights source).
    game_rows = await database.fetch_all(
        game_uploads.select()
        .where(game_uploads.c.player_id == player_id)
        .order_by(game_uploads.c.created_at.desc())
    )
    player["games"] = [
        {
            "id": g["id"],
            "job_id": g["job_id"],
            "status": g["status"],
            "progress": g["progress"],
            "jersey_number": g["jersey_number"],
            "player_name": g["player_name"],
            "results_key": g["results_key"],
            "created_at": str(g["created_at"]) if g["created_at"] else None,
            "completed_at": str(g["completed_at"]) if g["completed_at"] else None,
        }
        for g in game_rows
    ]
    return player


@router.post("/admin/players", status_code=201)
async def create_player(req: PlayerCreate, admin=Depends(get_admin_user)):
    owner = await database.fetch_one(users.select().where(users.c.id == req.owner_user_id))
    if not owner:
        raise HTTPException(status_code=400, detail="owner_user_id does not exist")
    pid = await database.execute(players.insert().values(**req.dict()))
    return {"id": pid, "message": "Player created"}


@router.put("/admin/players/{player_id}")
async def update_player(player_id: int, req: PlayerUpdate, admin=Depends(get_admin_user)):
    updates = {k: v for k, v in req.dict().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    await database.execute(players.update().where(players.c.id == player_id).values(**updates))
    return {"message": "Player updated"}


@router.delete("/admin/players/{player_id}")
async def delete_player(player_id: int, admin=Depends(get_admin_user)):
    await database.execute(players.delete().where(players.c.id == player_id))
    return {"message": "Player deleted"}


# ═════════════════════════════════════════════════════════════════════════════
# LINK a game upload to a player (bridge to the GPU pipeline)
# ═════════════════════════════════════════════════════════════════════════════
@router.post("/admin/games/{upload_id}/assign-player/{player_id}")
async def assign_game_to_player(upload_id: int, player_id: int, admin=Depends(get_admin_user)):
    g = await database.fetch_one(game_uploads.select().where(game_uploads.c.id == upload_id))
    if not g:
        raise HTTPException(status_code=404, detail="Game upload not found")
    p = await database.fetch_one(players.select().where(players.c.id == player_id))
    if not p:
        raise HTTPException(status_code=404, detail="Player not found")
    await database.execute(
        game_uploads.update().where(game_uploads.c.id == upload_id).values(player_id=player_id)
    )
    return {"message": "Game linked to player"}
