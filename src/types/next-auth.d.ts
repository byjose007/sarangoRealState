import type { UserRole } from '@/generated/prisma/enums';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    role: UserRole;
    agentId: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      agentId: string | null;
    } & DefaultSession['user'];
  }
}
