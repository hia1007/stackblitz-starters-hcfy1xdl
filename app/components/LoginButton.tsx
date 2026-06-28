'use client';
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginButton() {
  const { user, signInWithMagicLink, signOut } = useAuthStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signInWithMagicLink(email);
    setLoading(false);
    if (!error) {
      setSubmitted(true);
      setEmail('');
    }
  };

  if (user) {
    return (
      <button onClick={signOut} className="bg-red-500 text-white px-4 py-2 rounded">
        Logout
      </button>
    );
  }

  if (submitted) {
    return (
      <div className="text-green-600 text-sm">
        ✓ Check your email for the magic link!
      </div>
    );
  }

  return (
    <form onSubmit={handleSignIn} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="px-3 py-2 border rounded text-black"
        required
      />
      <button 
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded"
      >
        {loading ? 'Sending...' : 'Sign in'}
      </button>
    </form>
  );
}
