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

// `next-auth/jwt` re-exports its JWT type from `@auth/core/jwt` via `export
// *` — augmenting the re-exporting module doesn't merge into the original
// interface, so the callback signatures inside @auth/core (which import JWT
// from its own source module) never see it. Augment the source directly.
declare module '@auth/core/jwt' {
  interface JWT {
    role: UserRole;
    agentId: string | null;
  }
}
