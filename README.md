# MISHTEH - Connecting Donors with People in Need

MISHTEH is a Next.js-based web application that connects generous donors with people who need help with food, rent, bills, family support, job assistance, and more. The platform ensures security through user verification and document authentication.

## 🌟 Features

### Core Functionality
- **User Authentication**: Secure registration and login with JWT-based session management
- **Dual User Types**: 
  - **Donors**: Browse requests, make donations, track donation history
  - **Requesters**: Submit help requests, upload verification documents, manage requests
- **Request Management**: Create, edit, and withdraw help requests with detailed information
- **Donation System**: Pledge or donate to requests, track funding progress
- **Document Verification**: Upload and verify identity and proof of need documents
- **Search & Filter**: Find requests by category, location, urgency level
- **Admin Dashboard**: Verify users, approve requests, review documents

### Security Features
- Password hashing with bcrypt
- JWT-based authentication with NextAuth.js
- Protected routes and API endpoints
- File type and size validation for uploads
- User and document verification system

### User Experience
- Responsive design for desktop and mobile
- Real-time progress tracking for requests
- Donation history and statistics
- Anonymous donation option
- Notification system for updates

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **File Handling**: React Dropzone
- **Icons**: Lucide React
- **Validation**: Zod

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn package manager

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd mishteh
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mishteh?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secure-random-string-here"

# File Upload (Optional - defaults provided)
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/jpeg,image/png,application/pdf"

# Stripe (Optional - for payment integration)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Set Up the Database

#### Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mishteh;

# Exit psql
\q
```

#### Run Prisma Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed the database with sample data
npx prisma db seed
```

### 5. Create Upload Directories

```bash
mkdir -p public/uploads/documents
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
mishteh/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   └── uploads/               # Uploaded files
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── requests/     # Request management
│   │   │   ├── donations/    # Donation management
│   │   │   ├── documents/    # Document uploads
│   │   │   └── admin/        # Admin endpoints
│   │   ├── auth/             # Auth pages (login, register)
│   │   ├── dashboard/        # User dashboards
│   │   ├── requests/         # Request pages
│   │   ├── admin/            # Admin dashboard
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Homepage
│   │   └── globals.css       # Global styles
│   ├── components/           # Reusable components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── RequestCard.tsx
│   │   ├── DonationForm.tsx
│   │   ├── FileUpload.tsx
│   │   └── AuthProvider.tsx
│   ├── lib/
│   │   ├── prisma.ts         # Prisma client
│   │   └── auth.ts           # NextAuth configuration
│   ├── types/
│   │   └── next-auth.d.ts    # Type definitions
│   └── middleware.ts         # Route protection
├── .env.example              # Environment template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🔐 User Roles

### Donor
- Browse all active requests
- Make donations to requests
- View donation history
- Track impact and statistics

### Requester
- Create help requests
- Upload verification documents
- Manage active requests
- View donation received

### Admin
- Verify user documents
- Approve or reject requests
- Review uploaded documents
- View platform statistics

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Requests
- `GET /api/requests` - List all requests (with filters)
- `POST /api/requests` - Create new request
- `GET /api/requests/[id]` - Get request details
- `PATCH /api/requests/[id]` - Update request
- `DELETE /api/requests/[id]` - Withdraw request

### Donations
- `GET /api/donations` - Get user's donations
- `POST /api/donations` - Create donation

### Documents
- `POST /api/documents` - Upload document
- `GET /api/documents` - Get user's documents

### Admin
- `PATCH /api/admin/requests/[id]` - Approve/reject request
- `PATCH /api/admin/documents/[id]` - Verify/reject document

### User Profile
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update profile

## 🎨 Key Features Walkthrough

### For Donors

1. **Register** as a donor
2. **Browse requests** on the homepage or requests page
3. **Filter** by category, location, or urgency
4. **Click "Read More"** to view full request details
5. **Make a donation** with amount and optional message
6. **Track donations** in your dashboard

### For Requesters

1. **Register** as a requester
2. **Create a request** with detailed information
3. **Upload verification documents** (ID, proof of need)
4. **Wait for admin approval**
5. **Track donations** and communicate with donors
6. **Edit or withdraw** requests as needed

### For Admins

1. **Access admin dashboard** at `/admin`
2. **Review pending requests** and approve/reject
3. **Verify uploaded documents**
4. **Monitor platform statistics**
5. **Manage user accounts**

## 🔧 Database Schema

The application uses Prisma with PostgreSQL. Key models include:

- **User**: Stores user accounts (donors, requesters, admins)
- **Request**: Help requests from people in need
- **Donation**: Donation records
- **Document**: Uploaded verification documents
- **DonorPreference**: Donor notification preferences
- **Notification**: User notifications

View the complete schema in `prisma/schema.prisma`.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Ensure these are set in your production environment:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `MAX_FILE_SIZE`
- `ALLOWED_FILE_TYPES`

### Database Migration for Production

```bash
npx prisma migrate deploy
```

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build
```

## 📦 Optional Features to Implement

- **Email Notifications**: Integrate with SendGrid or similar
- **Payment Processing**: Integrate Stripe for real donations
- **Real-time Chat**: Add WebSocket support for donor-requester communication
- **Advanced Analytics**: Dashboard with charts and insights
- **Social Sharing**: Share requests on social media
- **Multi-language Support**: i18n for multiple languages

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@mishteh.com or open an issue in the GitHub repository.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- All contributors and supporters

---

**Built with ❤️ to help those in need**
