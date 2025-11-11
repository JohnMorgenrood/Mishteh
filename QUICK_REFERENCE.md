# MISHTEH - Quick Reference

## 🚀 Quick Commands

```bash
# Installation
npm install

# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint

# Database
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Run migrations (dev)
npx prisma migrate deploy # Run migrations (prod)
npx prisma studio        # Open Prisma Studio
npx prisma db push       # Push schema changes
npx prisma db seed       # Seed database

# Deployment
vercel                   # Deploy to Vercel
vercel --prod           # Deploy to production
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Homepage |
| `src/app/layout.tsx` | Root layout |
| `src/lib/auth.ts` | Auth configuration |
| `src/lib/prisma.ts` | Database client |
| `prisma/schema.prisma` | Database schema |
| `.env` | Environment variables |
| `next.config.js` | Next.js config |
| `tailwind.config.ts` | Tailwind config |

## 🔑 Environment Variables

```env
# Required
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Optional
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/jpeg,image/png,application/pdf"
```

## 🎯 User Roles

| Role | Can Do |
|------|--------|
| **DONOR** | Browse requests, make donations, track history |
| **REQUESTER** | Create requests, upload documents, receive donations |
| **ADMIN** | Approve requests, verify documents, manage users |

## 📋 Database Models

```
User → Request → Donation
User → Document
User → DonorPreference
User → Notification
Request → Document
```

## 🌐 Key Routes

### Public
- `/` - Homepage
- `/requests` - All requests
- `/requests/[id]` - Request detail
- `/auth/login` - Login
- `/auth/register` - Register

### Protected
- `/dashboard` - User dashboard
- `/dashboard/requests/new` - Create request
- `/admin` - Admin dashboard

### API
- `/api/auth/*` - Authentication
- `/api/requests` - Request management
- `/api/donations` - Donation management
- `/api/documents` - Document upload
- `/api/user/profile` - User profile

## 🔧 Common Tasks

### Create Admin User
```sql
UPDATE "User" SET "userType" = 'ADMIN' 
WHERE email = 'admin@example.com';
```

### Reset Database
```bash
npx prisma migrate reset
```

### View Database
```bash
npx prisma studio
```

### Check TypeScript
```bash
npx tsc --noEmit
```

### Clear Next.js Cache
```bash
rm -rf .next
```

## 📊 Request Categories

1. FOOD
2. RENT
3. BILLS
4. FAMILY_SUPPORT
5. JOB_ASSISTANCE
6. MEDICAL
7. EDUCATION
8. OTHER

## 🚨 Urgency Levels

1. LOW - Not urgent
2. MEDIUM - Normal priority
3. HIGH - High priority
4. CRITICAL - Immediate need

## 💰 Request Statuses

- **PENDING** - Awaiting admin review
- **ACTIVE** - Live and accepting donations
- **PARTIALLY_FUNDED** - Some funds received
- **FUNDED** - Target reached
- **WITHDRAWN** - Cancelled by user
- **REJECTED** - Denied by admin

## 📄 Document Types

- Identity verification (ID, passport)
- Proof of need
- Income statements
- General documents

## 🐛 Common Issues

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### Database Connection Error
- Check PostgreSQL is running
- Verify DATABASE_URL
- Check firewall settings

### Module Not Found
```bash
rm -rf node_modules
npm install
```

### Prisma Error
```bash
npx prisma generate
```

## 📞 Support

- **Documentation**: Check all .md files
- **Issues**: GitHub Issues
- **Email**: support@mishteh.com

## 🔗 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [Tailwind Docs](https://tailwindcss.com/docs)

## ⚡ Performance Tips

- Use server components where possible
- Implement pagination for large lists
- Optimize images with Next.js Image
- Enable caching for static content
- Use database indexes

## 🔒 Security Checklist

- [ ] Strong NEXTAUTH_SECRET set
- [ ] Database credentials secure
- [ ] HTTPS enabled in production
- [ ] File upload validation active
- [ ] Rate limiting configured
- [ ] CORS properly configured

## 📝 Before Deploying

- [ ] Update environment variables
- [ ] Run database migrations
- [ ] Test all features
- [ ] Create admin user
- [ ] Configure domain
- [ ] Set up monitoring

## 🎓 Learning Path

1. Read README.md
2. Follow SETUP.md
3. Explore codebase
4. Check FEATURES.md
5. Review API endpoints
6. Read DEPLOYMENT.md

---

**Need detailed info?** Check the full documentation files!

- README.md - Complete guide
- SETUP.md - Setup instructions
- DEPLOYMENT.md - Deployment guide
- FEATURES.md - Feature list
- CONTRIBUTING.md - How to contribute
