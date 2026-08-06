import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import type { JWT } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import type { UserRole } from '@/generated/prisma/enums';

/**
 * `next-auth/jwt`'s JWT type is re-exported (`export *`) from
 * `@auth/core/jwt`, a transitive dependency npm sometimes hoists to
 * top-level and sometimes nests under node_modules/next-auth depending on
 * what else is installed. Ambient `declare module '@auth/core/jwt'`
 * augmentation only merges when that physical module resolves from this
 * file's own node_modules lookup — which breaks silently across installs
 * when hoisting shifts. An explicit local type + casts sidesteps that.
 */
type AppJWT = JWT & { role: UserRole; agentId: string | null };

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== 'string' || typeof password !== 'string') return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) return null;

        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) return null;

        const agent = await prisma.agent.findUnique({
          where: { userId: user.id },
          select: { id: true },
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          agentId: agent?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      const appToken = token as AppJWT;
      if (user) {
        appToken.role = user.role;
        appToken.agentId = user.agentId;
      }
      return appToken;
    },
    session({ session, token }) {
      const appToken = token as AppJWT;
      session.user.id = appToken.sub!;
      session.user.role = appToken.role;
      session.user.agentId = appToken.agentId;
      return session;
    },
  },
});
