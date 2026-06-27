'use client';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginButton() {
  const { user, signInWithGoogle, signOut } = useAuthStore();

  if (user) {
    return (
      <button onClick={signOut} className="bg-red-500 text-white px-4 py-2 rounded">
        Logout
      </button>
    );
  }

  return (
    <button 
      onClick={signInWithGoogle} 
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Sign in with Google
    </button>
  );
}