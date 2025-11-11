# Getting Started Checklist

Complete this checklist to get MISHTEH up and running.

## ☑️ Initial Setup

### 1. Prerequisites
- [ ] Node.js v18+ installed
- [ ] PostgreSQL v14+ installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

### 2. Install Dependencies
```bash
cd mishteh
npm install
```
- [ ] Dependencies installed successfully
- [ ] No error messages

### 3. Environment Setup
```bash
cp .env.example .env
```
- [ ] `.env` file created
- [ ] `DATABASE_URL` configured
- [ ] `NEXTAUTH_SECRET` generated (run: `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` set to `http://localhost:3000`

### 4. Database Setup

#### Create Database
```bash
# Option 1: Using createdb command
createdb mishteh

# Option 2: Using psql
psql -U postgres
CREATE DATABASE mishteh;
\q
```
- [ ] PostgreSQL running
- [ ] Database created

#### Run Migrations
```bash
npx prisma generate
npx prisma migrate dev --name init
```
- [ ] Prisma Client generated
- [ ] Migrations completed
- [ ] No errors

### 5. Create Upload Directory
```bash
mkdir -p public/uploads/documents
```
- [ ] Upload directory created

### 6. Start Development Server
```bash
npm run dev
```
- [ ] Server started on http://localhost:3000
- [ ] No console errors
- [ ] Homepage loads correctly

## ☑️ First Run Testing

### 7. Test User Registration
- [ ] Visit http://localhost:3000/auth/register
- [ ] Register as a Donor
  - Name: Test Donor
  - Email: donor@test.com
  - Password: password123
- [ ] Registration successful
- [ ] Redirected to login

### 8. Test Login
- [ ] Visit http://localhost:3000/auth/login
- [ ] Login with donor account
- [ ] Successfully logged in
- [ ] Redirected to dashboard

### 9. Create Requester Account
- [ ] Logout from donor account
- [ ] Register as a Requester
  - Name: Test Requester
  - Email: requester@test.com
  - Password: password123
- [ ] Registration successful
- [ ] Login successful

### 10. Test Request Creation
- [ ] Login as requester
- [ ] Go to Dashboard
- [ ] Click "New Request"
- [ ] Fill out form:
  - Title: "Need help with groceries"
  - Category: Food
  - Urgency: High
  - Location: Your City
  - Description: At least 20 characters
- [ ] Submit request
- [ ] Request created (status: PENDING)

### 11. Create Admin Account
```sql
-- Connect to database
psql mishteh

-- Update user to admin
UPDATE "User" SET "userType" = 'ADMIN' WHERE email = 'donor@test.com';

-- Verify
SELECT email, "userType" FROM "User" WHERE "userType" = 'ADMIN';
```
- [ ] Admin user created
- [ ] Can access /admin route

### 12. Test Admin Approval
- [ ] Login as admin
- [ ] Visit /admin
- [ ] See pending request
- [ ] Approve request
- [ ] Request status changes to ACTIVE

### 13. Test Donation Flow
- [ ] Login as donor
- [ ] Browse requests
- [ ] Click on approved request
- [ ] Click "Donate Now"
- [ ] Enter amount: $50
- [ ] Add message (optional)
- [ ] Submit donation
- [ ] Donation created
- [ ] Request amount updated

### 14. Test Search & Filter
- [ ] Go to /requests page
- [ ] Test search by keyword
- [ ] Test filter by category
- [ ] Test filter by urgency
- [ ] Test filter by location
- [ ] Clear filters

### 15. Test File Upload
- [ ] Login as requester
- [ ] Create new request
- [ ] Upload a document (JPG/PNG/PDF under 5MB)
- [ ] Upload successful
- [ ] File appears in dashboard

## ☑️ Verify Features

### Core Features
- [ ] User registration (donor)
- [ ] User registration (requester)
- [ ] User login
- [ ] User logout
- [ ] Create request
- [ ] Edit request
- [ ] Withdraw request
- [ ] Make donation
- [ ] Upload document
- [ ] Search requests
- [ ] Filter requests
- [ ] Admin dashboard
- [ ] Approve request
- [ ] Verify document

### UI/UX
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Footer displays
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] No console errors
- [ ] Loading states work
- [ ] Error messages display
- [ ] Success messages display

### Database
- [ ] Users table populated
- [ ] Requests table populated
- [ ] Donations table populated
- [ ] Documents table populated
- [ ] Relationships working
- [ ] Can view in Prisma Studio

## ☑️ Optional Setup

### 16. Test with Prisma Studio
```bash
npx prisma studio
```
- [ ] Prisma Studio opens
- [ ] Can view all tables
- [ ] Can edit data
- [ ] Changes reflect in app

### 17. Run Sample SQL
```bash
psql mishteh < prisma/seed.sql
```
- [ ] Sample data created
- [ ] No errors

### 18. Configure for Production
- [ ] Read DEPLOYMENT.md
- [ ] Choose hosting platform
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Test deployment

## ☑️ Troubleshooting

If you encounter issues, check:

### Port Issues
```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### Database Issues
```bash
# Check PostgreSQL status
# Windows
pg_ctl status

# Mac
brew services list

# Linux
sudo service postgresql status
```

### Clear Cache
```bash
rm -rf .next
rm -rf node_modules
npm install
```

### Reset Database
```bash
npx prisma migrate reset
```

## ✅ You're Ready!

Once all items are checked, you have:
- ✅ A fully functional development environment
- ✅ Working authentication system
- ✅ Tested request and donation flows
- ✅ Admin dashboard operational
- ✅ Database properly configured

## 📚 Next Steps

1. **Read the documentation**
   - README.md for complete overview
   - FEATURES.md for feature details
   - DEPLOYMENT.md for production

2. **Customize the app**
   - Update branding
   - Modify color scheme
   - Add custom features

3. **Prepare for production**
   - Follow DEPLOYMENT.md
   - Set up monitoring
   - Configure backups

4. **Get support**
   - Check documentation
   - Review code comments
   - Open GitHub issues

---

## 🎉 Congratulations!

You've successfully set up MISHTEH! The platform is ready for development or deployment.

**Need help?** Check:
- README.md - Complete guide
- SETUP.md - Detailed setup
- QUICK_REFERENCE.md - Quick commands
- Documentation comments in code

**Ready to deploy?** Follow DEPLOYMENT.md

**Want to contribute?** Read CONTRIBUTING.md

---

**Happy coding! 🚀**
