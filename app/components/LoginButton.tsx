'use client';
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginButton() {
  const { user, signOut, setUser } = useAuthStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (code.trim() === '2022') {
      // Grant manager access locally
      useAuthStore.setState({ user: { id: 'manager-local', name: 'Manager' }, role: 'manager' });
      setCode('');
    } else {
      setError('Invalid manager code.');
    }
  };

  if (user) {
    return (
      <button onClick={signOut} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
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
          placeholder="Enter manager code"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Enter
        </button>
      </form>
      {error && <div className="text-red-600 text-sm font-semibold">{error}</div>}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="text-sm text-gray-500">Manager access</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
    </div>
  );
}
