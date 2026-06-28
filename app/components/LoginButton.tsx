'use client';
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginButton() {
  const { user, signOut, verifySecretCode } = useAuthStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      if (verifySecretCode(code)) {
        setCode('');
        setError('');
      } else {
        setError('Invalid manager code. Please try again.');
      }
      setLoading(false);
    }, 300);
  };

  if (user) {
    return (
      <button
        onClick={() => {
          signOut();
          setCode('');
          setError('');
        }}
        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors active:scale-95"
      >
        Logout
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter manager secret code"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors active:scale-95"
        >
          {loading ? 'Verifying...' : 'Enter'}
        </button>
      </form>
      {error && <div className="text-red-600 text-sm font-semibold text-center">{error}</div>}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="text-sm text-gray-500">Manager Access Required</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
    </div>
  );
}
