# Deployment Guide for MISHTEH

## Deploying to Vercel (Recommended)

Vercel is the easiest platform to deploy Next.js applications.

### Prerequisites
- GitHub account
- Vercel account (free at vercel.com)
- PostgreSQL database (Supabase, Railway, or Neon recommended)

### Step 1: Prepare Your Repository

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. Make sure `.env` is in `.gitignore` (it already is)

### Step 2: Set Up Production Database

Choose one of these options:

#### Option A: Supabase (Free)
1. Go to supabase.com
2. Create new project
3. Copy connection string from Settings > Database
4. Format: `postgresql://postgres:[password]@[host]:5432/postgres`

#### Option B: Railway (Free)
1. Go to railway.app
2. Create new project > PostgreSQL
3. Copy DATABASE_URL from Variables tab

#### Option C: Neon (Free)
1. Go to neon.tech
2. Create new project
3. Copy connection string

### Step 3: Deploy to Vercel

1. Go to vercel.com and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next

5. Add Environment Variables:
```
DATABASE_URL=your_production_database_url
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_production_secret
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf
```

6. Click "Deploy"

### Step 4: Run Database Migrations

After deployment, run migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Run migration
vercel env pull .env.production
DATABASE_URL="your_production_url" npx prisma migrate deploy
```

Or use Prisma Data Platform for migrations.

### Step 5: Create Admin User

1. Register a user through your deployed app
2. Connect to your production database
3. Run this SQL:
```sql
UPDATE "User" SET "userType" = 'ADMIN' WHERE email = 'your-admin-email@example.com';
```

## Deploying to Other Platforms

### Railway

1. Go to railway.app
2. Create new project
3. Add PostgreSQL service
4. Connect GitHub repository
5. Add environment variables
6. Deploy

### DigitalOcean App Platform

1. Create new app
2. Connect GitHub repository
3. Add PostgreSQL database
4. Configure environment variables
5. Deploy

### AWS (Advanced)

Use AWS Amplify or:
- EC2 for hosting
- RDS for PostgreSQL
- S3 for file storage
- CloudFront for CDN

## Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Create test donor and requester accounts
- [ ] Create test request
- [ ] Test donation flow
- [ ] Test file upload
- [ ] Create admin user
- [ ] Test admin approval workflow
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring (Vercel Analytics)
- [ ] Configure error tracking (Sentry)
- [ ] Test all features in production

## Custom Domain Setup (Vercel)

1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Wait for DNS propagation (can take up to 48 hours)
6. Update `NEXTAUTH_URL` to your custom domain

## File Storage for Production

For production, consider moving file uploads to cloud storage:

### Cloudinary Setup
```bash
npm install cloudinary
```

Update `.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### AWS S3 Setup
```bash
npm install @aws-sdk/client-s3
```

Update `.env`:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=your_bucket_name
```

## Monitoring and Analytics

### Vercel Analytics
Add to your app:
```bash
npm install @vercel/analytics
```

In `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Sentry Error Tracking
```bash
npm install @sentry/nextjs
```

Follow Sentry setup wizard:
```bash
npx @sentry/wizard@latest -i nextjs
```

## Performance Optimization

1. **Image Optimization**: Already configured with Next.js Image component
2. **Caching**: Configure in `next.config.js`
3. **CDN**: Automatically handled by Vercel
4. **Database Connection Pooling**: Use Prisma connection pooling

## Backup Strategy

### Database Backups

#### Automated (Recommended)
- Supabase: Daily automatic backups
- Railway: Point-in-time recovery
- Neon: Automatic backups

#### Manual
```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### File Backups
If using local storage, set up automated backups:
```bash
# Cron job example
0 2 * * * tar -czf /backups/uploads-$(date +\%Y\%m\%d).tar.gz /path/to/uploads
```

## Scaling Considerations

### When You Need to Scale

- Use Redis for session storage
- Implement database read replicas
- Use a CDN for static assets
- Implement caching strategies
- Consider serverless functions for heavy operations
- Use a message queue for background jobs

## Security Checklist

- [ ] Use HTTPS only (enforced by Vercel)
- [ ] Set secure environment variables
- [ ] Implement rate limiting (use Vercel rate limiting)
- [ ] Enable CORS properly
- [ ] Use Content Security Policy headers
- [ ] Implement SQL injection protection (Prisma handles this)
- [ ] Validate all user inputs
- [ ] Sanitize file uploads
- [ ] Use security headers

Add to `next.config.js`:
```js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

## Troubleshooting Deployment Issues

### Build Fails
- Check Node.js version compatibility
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors
- Verify environment variables

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if database allows external connections
- Ensure SSL is configured if required
- Check firewall rules

### File Upload Issues in Production
- Vercel's serverless functions have size limits
- Consider using cloud storage (S3, Cloudinary)
- Implement chunked uploads for large files

## Cost Estimates

### Free Tier (Hobby Projects)
- Vercel: Free (with limits)
- Supabase: Free (500MB database, 2GB bandwidth)
- Railway: $5 credit/month

### Paid Plans (Production)
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Railway: Pay-as-you-go

## Support

If you encounter issues during deployment:
1. Check Vercel deployment logs
2. Review database connection logs
3. Check application logs in production
4. Consult Next.js deployment docs
5. Open an issue on GitHub

---

Good luck with your deployment! 🚀
