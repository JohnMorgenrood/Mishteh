import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

// SECURITY: Only the site owner can be ADMIN - NO OTHER ADMINS ALLOWED
const ADMIN_EMAILS = ['mishteh144@gmail.com'];

// Helper function to check if email is admin (strict check)
function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

// Security logging helper (inline to avoid circular dependencies)
async function logAuthEvent(eventType: string, email: string, userId?: string | null, details?: string) {
  try {
    await prisma.securityLog.create({
      data: {
        eventType,
        email,
        userId: userId || null,
        ipAddress: 'server-side', // IP captured at API level
        details,
      },
    });
  } catch (e) {
    console.error('Failed to log auth event:', e);
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          // Log failed login attempt
          await logAuthEvent('LOGIN_FAILED', credentials.email, null, 'User not found or no password');
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          // Log failed login attempt
          await logAuthEvent('LOGIN_FAILED', credentials.email, user.id, 'Invalid password');
          throw new Error('Invalid credentials');
        }

        // Log successful login
        await logAuthEvent('LOGIN_SUCCESS', user.email, user.id, 'Credentials login');
        
        // Update last login time
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        }).catch(() => {});

        // SECURITY: Check if user is an admin using whitelist
        const userType = isAdminEmail(user.email) ? 'ADMIN' : user.userType;

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          userType: userType,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign-in
      if (account?.provider === 'google') {
        try {
          const email = user.email;
          if (!email) return false;

          // Check if user exists
          let dbUser = await prisma.user.findUnique({
            where: { email },
          });

          // Create user if doesn't exist
          if (!dbUser) {
            // SECURITY: Only set ADMIN if email is in whitelist
            const userType = isAdminEmail(email) ? 'ADMIN' : 'DONOR';
            
            dbUser = await prisma.user.create({
              data: {
                email,
                password: null, // OAuth users don't have passwords
                fullName: user.name || 'Google User',
                userType: userType,
                image: user.image,
              },
            });
            
            // Log Google signup
            await logAuthEvent('SIGNUP_GOOGLE', email, dbUser.id, 'New Google OAuth user');
          } else {
            // Log Google login
            await logAuthEvent('LOGIN_SUCCESS', email, dbUser.id, 'Google OAuth login');
            
            // Update last login time
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { lastLoginAt: new Date() },
            }).catch(() => {});
          }

          // SECURITY: Override userType - only allow ADMIN if email is in whitelist
          const finalUserType = isAdminEmail(email) ? 'ADMIN' : (dbUser.userType === 'ADMIN' ? 'DONOR' : dbUser.userType);

          // Store the database user ID in the account
          user.id = dbUser.id;
          (user as any).userType = finalUserType;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        // SECURITY: Only set ADMIN if email is in whitelist
        token.userType = isAdminEmail(user.email || '') ? 'ADMIN' : (user as any).userType;
      } else if (token.id) {
        // SECURITY: Always enforce admin whitelist on every request
        if (token.email && isAdminEmail(token.email as string)) {
          token.userType = 'ADMIN';
        } else {
          // Refresh user data from database but NEVER allow ADMIN unless in whitelist
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { userType: true },
          });
          if (dbUser) {
            // SECURITY: Even if database says ADMIN, only allow if in whitelist
            token.userType = dbUser.userType === 'ADMIN' && !isAdminEmail(token.email as string) 
              ? 'DONOR' 
              : dbUser.userType;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.userType = token.userType as any;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If user is being redirected after sign in, check the URL
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // For callback URLs, redirect based on user type
      if (url.includes('/api/auth/callback')) {
        // This will be handled by the calling page
        return baseUrl;
      }
      
      // Default redirect to base URL
      return baseUrl;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
