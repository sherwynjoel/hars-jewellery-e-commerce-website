# 🐳 Docker Setup Guide

## Prerequisites

- Docker Desktop installed and running
- `.env` file configured (see `env.example`)

## Quick Start (App Only - Recommended for Development)

### Step 1: Navigate to project folder

```powershell
cd "C:\Users\Sherwyn joel\OneDrive\Desktop\hars jewellery"
```

### Step 2: Ensure .env file exists

```powershell
# If .env doesn't exist, copy from example
Copy-Item env.example .env
notepad .env
```

**Required in .env:**
- `DATABASE_URL=file:./dev.db`
- `NEXTAUTH_URL=http://localhost:3000`
- `NEXTAUTH_SECRET=your-secret-key`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` (for OTP emails)
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (for payments)

### Step 3: Build and start the container

```powershell
docker compose build app
docker compose up -d app
```

### Step 4: Initialize database

```powershell
docker compose exec app npx prisma db push
docker compose exec app npm run db:seed
```

### Step 5: Access your application

- **Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
  - Login: `admin@harsjewellery.com` / `admin123`

---

## Common Docker Commands

### View running containers

```powershell
docker compose ps
```

### View logs (real-time)

```powershell
docker compose logs -f app
```

### View last 100 lines of logs

```powershell
docker compose logs --tail=100 app
```

### Stop the container

```powershell
docker compose down
```

### Restart the container

```powershell
docker compose restart app
```

### Rebuild and restart (after code changes)

```powershell
docker compose down
docker compose build --no-cache app
docker compose up -d app
```

### Access container shell

```powershell
docker compose exec app sh
```

### Run Prisma commands

```powershell
# Generate Prisma client
docker compose exec app npx prisma generate

# Push schema changes to database
docker compose exec app npx prisma db push

# Seed database (create admin user)
docker compose exec app npm run db:seed
```

### View container status

```powershell
docker compose ps
docker stats
```

---

## Full Stack (App + Nginx)

If you want to run with Nginx reverse proxy:

```powershell
docker compose up -d --build
```

**Note:** Nginx requires SSL certificates in `./ssl` folder. For development, just use the app service alone.

---

## Troubleshooting

### Port 3000 already in use

Edit `docker-compose.yml` and change port mapping:

```yaml
ports:
  - "3001:3000"  # Use 3001 instead
```

Then access at: http://localhost:3001

### Container won't start

Check logs:
```powershell
docker compose logs app
```

### Database errors

Reset database:
```powershell
docker compose exec app npx prisma db push --force-reset
docker compose exec app npm run db:seed
```

### Changes not reflecting

Rebuild container:
```powershell
docker compose down
docker compose build --no-cache app
docker compose up -d app
```

### View all Docker containers

```powershell
docker ps -a
```

### Remove all containers and images

```powershell
docker compose down --rmi all --volumes
```

---

## Complete Setup Workflow

```powershell
# 1. Navigate to project
cd "C:\Users\Sherwyn joel\OneDrive\Desktop\hars jewellery"

# 2. Ensure .env exists and is configured
if (-not (Test-Path .env)) {
    Copy-Item env.example .env
    notepad .env
}

# 3. Stop any existing containers
docker compose down

# 4. Build the image
docker compose build app

# 5. Start the container
docker compose up -d app

# 6. Wait a few seconds, then check logs
docker compose logs app

# 7. Initialize database
docker compose exec app npx prisma db push
docker compose exec app npm run db:seed

# 8. Open browser
Start-Process "http://localhost:3000"
```

---

## Production Deployment

For production, ensure:
- `.env` has production values
- Database URL points to production database (PostgreSQL recommended)
- `NEXTAUTH_URL` is your production domain
- SSL certificates configured for Nginx

---

## Useful Aliases (Optional)

Add to PowerShell profile for shortcuts:

```powershell
# Edit profile
notepad $PROFILE

# Add these aliases:
function dcu { docker compose up -d app }
function dcd { docker compose down }
function dcl { docker compose logs -f app }
function dcr { docker compose restart app }
function dcb { docker compose build app }
```

Then use: `dcu` to start, `dcd` to stop, `dcl` for logs, etc.

