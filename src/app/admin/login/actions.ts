'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/lib/auth';
import { getClientIp, rateLimit, resetRateLimit } from '@/lib/rate-limit';

export interface LoginState {
  error?: string;
}

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const ip = await getClientIp();
  const rateLimitKey = `login:${ip}`;
  const { ok, retryAfterSeconds } = rateLimit(rateLimitKey, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!ok) {
    const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
    return {
      error: `Demasiados intentos. Vuelve a intentarlo en ${minutes} minuto${minutes === 1 ? '' : 's'}.`,
    };
  }

  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: (formData.get('callbackUrl') as string) || '/admin/dashboard',
    });
    resetRateLimit(rateLimitKey);
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Email o contraseña incorrectos.' };
    }
    // NextAuth's redirect on success is implemented as a thrown error — let it propagate.
    resetRateLimit(rateLimitKey);
    throw error;
  }
}
