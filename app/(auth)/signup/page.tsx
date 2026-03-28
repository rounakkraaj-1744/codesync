'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-md space-y-8 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
        <div className="text-center">
          <h1 className="text-3xl font-black bg-linear-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Join CodeSync</h1>
          <p className="mt-2 text-white/40 text-sm">Create an account to start syncing</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest opacity-60">Full Name</label>
            <input 
              type="text" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest opacity-60">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest opacity-60">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-400 text-xs font-bold">{error}</p>}

          <button className="w-full bg-[#ededed] text-[#050505] font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
            Join Now
          </button>
        </form>

        <p className="text-center text-xs opacity-40">
          Already have an account? <Link href="/login" className="text-blue-400 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
