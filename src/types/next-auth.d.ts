import { UserType } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      userType: UserType;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    userType: UserType;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    userType: UserType;
  }
}
