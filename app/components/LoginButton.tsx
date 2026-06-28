'use client';
import { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useAuthStore } from '../store/useAuthStore';
import { Mail } from 'lucide-react';

export default function LoginButton() {
  const { data: session, status } = useSession();
  const sessionUser = session?.user ?? null;
  const { fetchProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    useAuthStore.setState({ user: sessionUser });
    if (sessionUser?.id) fetchProfile(sessionUser.id as string);
  }, [sessionUser, fetchProfile]);

  if (status === 'loading') return <div className="px-4 py-2">Loading...</div>;

  if (sessionUser) {
    return (
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
      >
        Logout
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <button
        onClick={() => {
          setLoading(true);
          signIn('auth0').finally(() => setLoading(false));
        }}
        disabled={loading}
        className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="10" fill="#111827" />
        </svg>
        {loading ? 'Signing in...' : 'Sign in with Auth0'}
      </button>
    </div>
  );
}
