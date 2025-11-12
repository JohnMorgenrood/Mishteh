import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
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
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          userType: user.userType,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle GitHub OAuth sign-in
      if (account?.provider === 'github') {
        try {
          const email = user.email;
          if (!email) return false;

          // Check if user exists
          let dbUser = await prisma.user.findUnique({
            where: { email },
          });

          // Create user if doesn't exist
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email,
                fullName: user.name || 'GitHub User',
                userType: 'DONOR', // Default to DONOR for GitHub sign-ins
                image: user.image,
              },
            });
          }

          // Store the database user ID in the account
          user.id = dbUser.id;
          (user as any).userType = dbUser.userType;
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
        token.userType = (user as any).userType;
      } else if (token.id) {
        // Refresh user data from database to get latest userType
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { userType: true },
        });
        if (dbUser) {
          token.userType = dbUser.userType;
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
