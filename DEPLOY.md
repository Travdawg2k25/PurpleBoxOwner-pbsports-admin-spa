# PB Sports Admin — Deploy

Admin SPA (React + Vite + Tailwind) for the Purple Box Sports FastAPI backend,
plus the additive **recruiting** backend changes (`backend/`).

Production target: `pbsports-web` EC2 `i-0f000efe2609f66ba`
(AWS account 950447199351, us-east-2). API at `/opt/pbsports-api`, served by
`uvicorn app.main:app` on :8000 (manual nohup, not systemd). Nginx serves the
web root at `/var/www/pbsports` and proxies `/api` -> 127.0.0.1:8000.

## Contents
- `src/`, `index.html`, `vite.config.js`, ... — the admin SPA source
- `backend/app/database.py` — adds recruiting tables (sports, colleges,
  players, coaches) + `game_uploads.player_id`. **Additive** — preserves all
  existing tables.
- `backend/app/main.py` — registers `recruiting_router`. **Preserves**
  `games_router` + all other routers.
- `backend/app/routers/recruiting_router.py` — new admin CRUD for the
  recruiting domain.

## Deploy from CloudShell (has S3 + SSM access)

```bash
# 1. clone
git clone https://github.com/PurpleBoxOwner/pbsports-admin-spa.git
cd pbsports-admin-spa

# 2. build the SPA
npm install
npm run build          # emits dist/

# 3. deploy BACKEND (additive) — copy 3 files, migrate, restart
tar -C backend -czf /tmp/be.tgz app
aws s3 cp /tmp/be.tgz s3://elasticbeanstalk-us-east-2-950447199351/transfer/be.tgz --region us-east-2
# then via SSM on the box: back up, extract over /opt/pbsports-api,
# add player_id column if missing, restart uvicorn (see commands in chat).

# 4. deploy FRONTEND — ship dist/ to the web root
tar -C dist -czf /tmp/spa.tgz .
aws s3 cp /tmp/spa.tgz s3://elasticbeanstalk-us-east-2-950447199351/transfer/spa.tgz --region us-east-2
# then via SSM: back up /var/www/pbsports, extract dist into web root.
```

## Notes
- Backend is **additive**: never overwrite `games_router.py` or other files.
- SQLite migration adds `player_id` to `game_uploads`
  (`ALTER TABLE game_uploads ADD COLUMN player_id INTEGER`); the 4 new tables
  are created by `create_all` at startup.
- Restart = kill the uvicorn PID, re-launch:
  `cd /opt/pbsports-api && sudo TMPDIR=/opt/pbsports-api/uploadtmp nohup python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &`
- Backups taken before deploy: `/opt/pbsports-api.bak-<TS>` and
  `/opt/pbsports-api.dbbak-<TS>.db`.
