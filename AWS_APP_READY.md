# App Readiness Checklist (AWS)

## 1) Environment variables

Set these in AWS App Runner service configuration:

- `NODE_ENV=production`
- `PORT=3000`
- `USE_LOCAL_DB=false`
- `DATABASE_URL=<your postgres connection string>`
- `CORS_ORIGIN=https://yourdomain.com` (optional but recommended)

Use `backend/.env.example` as reference.

## 2) Database

- Do not use SQLite in production containers.
- Use managed PostgreSQL (RDS or Supabase).
- Ensure the database schema/tables are created before go-live.

## 3) Health check

Use this endpoint for service health checks:

- `GET /api/health`

It verifies both server and database connectivity.
