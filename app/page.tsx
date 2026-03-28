'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateSessionId, cn } from '@/lib/utils';
import { Plus, Users, Clock, Shield, Laptop, ArrowRight, Brain, Zap, Share2, LogIn, UserPlus } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const startCoding = () => {
    setIsLoading(true);
    const id = generateSessionId();
    router.push(`/session/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] selection:bg-blue-500/30 font-sans selection:text-white relative overflow-hidden flex flex-col items-center px-6">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full max-w-7xl flex items-center justify-between py-6 px-8 z-50 backdrop-blur-sm">
        <h1 className="text-xl font-bold bg-linear-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">CodeSync</h1>
        <div className="flex items-center gap-6">
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium opacity-60">Welcome, {session.user?.name}</span>
              <button 
                onClick={() => signOut()}
                className="text-sm font-bold bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 transition-all"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity flex items-center gap-2">
                <LogIn size={16} /> Sign In
              </Link>
              <Link href="/signup" className="text-sm font-bold bg-[#ededed] text-[#050505] px-5 py-2 rounded-full hover:scale-105 transition-all flex items-center gap-2">
                <UserPlus size={16} /> Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-500/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="z-10 w-full max-w-5xl text-center space-y-12 pt-32">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold backdrop-blur-md text-blue-400 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
           <Zap size={14} className="fill-current animate-pulse" />
           REAL-TIME COLLABORATIVE ENGINE
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          Sync your code.<br />
          <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">Power your team.</span>
        </h1>

        <p className="max-w-xl mx-auto text-lg text-[#ededed]/60 font-medium animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          The elite platform for technical interviews, pair programming, and collaborative learning. Powered by Llama 3 AI.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <button 
            onClick={startCoding}
            disabled={isLoading}
            className="group relative flex items-center justify-center gap-4 bg-[#ededed] text-[#050505] px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "Creating session..." : "New CodeSync Session"}
            {!isLoading && <ArrowRight className="w-6 h-6 transform transition-transform group-hover:translate-x-1" />}
          </button>
          
          <div className="flex -space-x-3 items-center group cursor-pointer hover:scale-105 transition-transform">
             {[1,2,3,4].map(idx => (
               <div key={idx} className="w-10 h-10 rounded-full border-2 border-[#050505] bg-white/10 flex items-center justify-center backdrop-blur-sm overflow-hidden ring-offset-2 ring-blue-500 hover:ring-2 transition-all">
                  <img src={`https://i.pravatar.cc/100?u=${idx}`} alt="avatar" className="w-full h-full object-cover grayscale opacity-80" />
               </div>
             ))}
             <span className="ml-6 text-sm font-semibold opacity-60">+24k active coders</span>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 pt-24 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
          {[
            { icon: <Shield className="text-blue-500" />, title: "Interview Ready", desc: "Private roles, secret notes, and automated evaluation rubrics." },
            { icon: <Laptop className="text-purple-500" />, title: "Sandboxed Exec", desc: "Run your code instantly in isolated environments. Stdout at zero latency." },
            { icon: <Brain className="text-indigo-500" />, title: "AI Copilot", desc: "Llama 3 powered code insights, refactoring, and real-time logic analysis." }
          ].map((feature, i) => (
            <div key={i} className="group p-8 rounded-3xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all hover:-translate-y-2 text-left space-y-4">
               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 {feature.icon}
               </div>
               <h3 className="text-xl font-bold">{feature.title}</h3>
               <p className="text-sm text-[#ededed]/40 leading-relaxed font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="mt-32 w-full border-t border-white/5 pt-12 pb-12 flex flex-col md:flex-row items-center justify-between opacity-40 text-sm font-medium">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          <span>© 2026 CodeSync Collaborative Technologies</span>
        </div>
        <div className="flex gap-8 mt-4 md:mt-0">
          <a href="#" className="hover:text-blue-400 transition-colors">Documentation</a>
          <a href="#" className="hover:text-blue-400 transition-colors">API Keys</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
