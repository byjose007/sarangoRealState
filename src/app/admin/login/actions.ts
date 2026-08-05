'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/lib/auth';

export interface LoginState {
  error?: string;
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: (formData.get('callbackUrl') as string) || '/admin/dashboard',
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Email o contraseña incorrectos.' };
    }
    // NextAuth's redirect on success is implemented as a thrown error — let it propagate.
    throw error;
  }
}
