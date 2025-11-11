# MISHTEH Setup Guide

## Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/mishteh"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

Generate secret:
```bash
openssl rand -base64 32
```

### 3. Setup Database
```bash
# Create database
createdb mishteh

# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

### 4. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

## Database Setup Options

### Option 1: Local PostgreSQL

Install PostgreSQL:
- **Windows**: Download from postgresql.org
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`

Start PostgreSQL:
```bash
# Mac
brew services start postgresql

# Linux
sudo service postgresql start
```

Create database:
```bash
createdb mishteh
```

### Option 2: Docker

```bash
docker run --name mishteh-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=mishteh \
  -p 5432:5432 \
  -d postgres:14
```

### Option 3: Cloud Database

Use services like:
- **Supabase** (Free tier available)
- **Railway** (Free tier available)
- **Neon** (Free tier available)

Update `DATABASE_URL` with connection string.

## First Time Setup

### Create Test Users

After starting the app, register:

1. **Donor Account**
   - Name: Test Donor
   - Email: donor@test.com
   - Password: password123
   - Type: Donor

2. **Requester Account**
   - Name: Test Requester
   - Email: requester@test.com
   - Password: password123
   - Type: Requester

3. **Admin Account** (Manual Database Update Required)
   ```sql
   UPDATE "User" 
   SET "userType" = 'ADMIN' 
   WHERE email = 'admin@test.com';
   ```

### Create Sample Data

Use Prisma Studio:
```bash
npx prisma studio
```

Or seed script (create `prisma/seed.ts`).

## Common Issues

### Port 3000 Already in Use
```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### Database Connection Error
- Check PostgreSQL is running
- Verify DATABASE_URL is correct
- Ensure database exists

### Prisma Generate Error
```bash
# Clear node_modules
rm -rf node_modules
npm install
npx prisma generate
```

### Module Not Found Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## Development Tips

### View Database
```bash
npx prisma studio
```

### Reset Database
```bash
npx prisma migrate reset
```

### Format Prisma Schema
```bash
npx prisma format
```

### Check for Type Errors
```bash
npx tsc --noEmit
```

## Production Checklist

- [ ] Set strong NEXTAUTH_SECRET
- [ ] Update NEXTAUTH_URL to production domain
- [ ] Configure production database
- [ ] Set up file storage (AWS S3, Cloudinary)
- [ ] Enable HTTPS
- [ ] Set up email service
- [ ] Configure error monitoring (Sentry)
- [ ] Set up analytics
- [ ] Create backup strategy
- [ ] Review security settings

## Need Help?

- Check README.md for detailed documentation
- Review Next.js docs: https://nextjs.org/docs
- Review Prisma docs: https://www.prisma.io/docs
- Check GitHub issues

---

Happy coding! 🚀
