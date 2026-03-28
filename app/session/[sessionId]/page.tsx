'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import MonacoEditor from '@/components/Editor/MonacoEditor';
import { useWebSocket } from '@/hooks/useWebSocket';
import { getRandomColor, cn } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { 
  Users, Play, MessageSquare, Shield, Share2, 
  Settings, Terminal, Brain, HelpCircle, Clock, 
  StickyNote, Circle, Square, FastForward, RotateCcw, 
  UserCircle, LogOut, ChevronDown, CheckCircle2, Zap
} from 'lucide-react';
import { useSession as useNextAuthSession } from "next-auth/react";

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const router = useRouter();
  const { data: nextAuthSession } = useNextAuthSession();
  
  // User Identity
  const [userName, setUserName] = useState(() => `Guest_${Math.floor(Math.random() * 1000)}`);
  const [userId, setUserId] = useState(() => Math.random().toString(36).substring(7));
  const [userColor] = useState(() => getRandomColor());

  useEffect(() => {
    if (nextAuthSession?.user) {
      setUserName(nextAuthSession.user.name || `User_${Math.floor(Math.random() * 1000)}`);
      setUserId((nextAuthSession.user as any).id);
    }
  }, [nextAuthSession]);
  
  // Session State
  const [code, setCode] = useState('// Syncing...');
  const [language, setLanguage] = useState('javascript');
  const [mode, setMode] = useState<'interview' | 'teaching' | 'pair-programming'>('pair-programming');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isOutputOpen, setIsOutputOpen] = useState(true);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  
  // Interview Mode States
  const [timer, setTimer] = useState(3600); // 1 hour
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingEvents, setRecordingEvents] = useState<any[]>([]);

  const { socket, onlineUsers, isConnected, emitCodeChange, emitCursorMove, emitLanguageChange, emitModeChange } = useWebSocket({
    sessionId,
    userName,
    userId,
  });

  // Load Session from DB via Socket Join effect (already handled in server.js upsert)
  useEffect(() => {
    if (socket) {
      socket.on('code-update', (data: any) => setCode(data.code));
      socket.on('language-updated', (lang: string) => setLanguage(lang));
      socket.on('mode-updated', (m: any) => setMode(m));
      socket.on('chat-message-received', (msg: any) => {
        // Chat implementation placeholder
      });
      socket.on('recording-started', () => setIsRecording(true));
      socket.on('recording-stopped', () => setIsRecording(false));
    }
  }, [socket]);

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (newCode: string | undefined) => {
    if (newCode !== undefined) {
      setCode(newCode);
      emitCodeChange(newCode);
    }
  };

  const handleCursorChange = (position: { line: number; column: number }) => {
    emitCursorMove(position, userName, userColor);
  };

  const handleModeChange = (newMode: any) => {
    setMode(newMode);
    emitModeChange(newMode);
  };

  const toggleRecording = () => {
    if (isRecording) {
      socket?.emit('stop-recording', sessionId);
    } else {
      socket?.emit('start-recording', sessionId);
    }
    setIsRecording(!isRecording);
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code }),
      });
      const data = await res.json();
      setOutput(data.stdout || data.stderr || 'No output');
    } catch (err) {
      setOutput('Failed to execute code');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex bg-[#050505] text-[#ededed] h-screen overflow-hidden font-sans">
      <div className="flex flex-col flex-1">
        {/* Navbar */}
        <nav className="h-14 border-b border-white/5 bg-[#050505] flex items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <h1 onClick={() => router.push('/')} className="text-xl font-bold bg-linear-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent cursor-pointer">CodeSync</h1>
            
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
               {(['interview', 'teaching', 'pair-programming'] as const).map(m => (
                 <button 
                   key={m}
                   onClick={() => handleModeChange(m)}
                   className={cn(
                     "px-3 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all",
                     mode === m ? "bg-blue-600 text-white shadow-lg" : "text-white/40 hover:text-white/70"
                   )}
                 >
                   {m.split('-')[0]}
                 </button>
               ))}
            </div>

            <select 
              value={language} 
              onChange={(e) => {
                setLanguage(e.target.value);
                emitLanguageChange(e.target.value);
              }}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500 appearance-none min-w-[100px] text-center"
            >
              <option value="javascript">JAVASCRIPT</option>
              <option value="python">PYTHON</option>
              <option value="java">JAVA</option>
              <option value="cpp">C++</option>
              <option value="go">GO</option>
              <option value="rust">RUST</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            {isRecording && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-bold text-red-400 animate-pulse">
                <Circle size={8} fill="currentColor" /> REC
              </div>
            )}
            
            <button 
              onClick={toggleRecording}
              className={cn(
                "p-2 rounded-full transition-all",
                isRecording ? "bg-red-500 text-white" : "bg-white/5 text-white/40 hover:text-white"
              )}
            >
              {isRecording ? <Square size={16} /> : <Circle size={16} />}
            </button>

            <div className="h-8 w-px bg-white/10 mx-2" />

            <div className="flex -space-x-2">
              {onlineUsers.map((u, i) => (
                <div 
                  key={i} 
                  className="w-8 h-8 rounded-full border-2 border-[#050505] flex items-center justify-center text-[10px] font-bold shadow-lg"
                  style={{ backgroundColor: getRandomColor() }}
                  title={u.name}
                >
                  {u.name.substring(0, 1).toUpperCase()}
                </div>
              ))}
            </div>
            
            <button 
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isRunning ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={16} fill="currentColor" />}
              RUN
            </button>
            
            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10">
              <UserCircle size={20} className="text-white/60" />
            </button>
          </div>
        </nav>

        <main className="flex flex-1 overflow-hidden">
          {/* Main Editor Section */}
          <div className="flex flex-col flex-1 overflow-hidden bg-[#0A0A0A]">
            {/* Context Toolbar (Mode Specific) */}
            <div className="h-10 bg-[#080808] border-b border-white/5 flex items-center justify-between px-4">
               <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest opacity-40 uppercase">
                  <div className="flex items-center gap-2 text-blue-400 opacity-100">
                    <Shield size={12} /> {mode} MODE
                  </div>
                  {mode === 'interview' && (
                    <div className="flex items-center gap-2 border-l border-white/10 pl-4 text-white">
                      <Clock size={12} /> {formatTime(timer)}
                      <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="ml-2 hover:text-blue-400">
                        {isTimerRunning ? "PAUSE" : "START"}
                      </button>
                    </div>
                  )}
               </div>
               <div className="flex items-center gap-4 text-[10px] font-bold opacity-40">
                 <span>{onlineUsers.length} COLLABORATORS</span>
                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
               </div>
            </div>

            <div className="flex-1 min-h-0 relative">
               <MonacoEditor 
                 code={code} 
                 language={language} 
                 onChange={handleCodeChange}
                 onCursorChange={handleCursorChange}
               />
            </div>

            {/* Terminal Area */}
            {isOutputOpen && (
              <div className="h-56 border-t border-white/5 bg-[#050505] flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#080808]">
                  <div className="flex items-center gap-2 text-[10px] font-black tracking-widest opacity-40">
                    <Terminal size={12} />
                    DEBUGGER OUTPUT
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setOutput('')} className="text-[10px] font-bold opacity-30 hover:opacity-100 transition-opacity">CLEAR</button>
                    <button onClick={() => setIsOutputOpen(false)} className="text-[10px] font-bold opacity-30 hover:opacity-100 transition-opacity">CLOSE</button>
                  </div>
                </div>
                <div className="flex-1 p-5 font-mono text-sm overflow-auto scrollbar-hide">
                  <pre className={cn(
                    "whitespace-pre-wrap leading-relaxed", 
                    output.toLowerCase().includes('error') ? "text-red-400" : "text-blue-300"
                  )}>
                    {output || "> Ready for execution..."}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Sidebars (Right) */}
          {isSidebarOpen && (
            <aside className="w-80 border-l border-white/5 bg-[#080808] flex flex-col shadow-2xl">
              <div className="flex border-b border-white/5 p-1 bg-[#050505]">
                <button className="flex-1 py-2 text-[10px] font-black tracking-widest border-b-2 border-blue-500 text-blue-400">CO-PILOT</button>
                <button className="flex-1 py-2 text-[10px] font-black tracking-widest opacity-30 hover:opacity-100 transition-opacity">NOTES</button>
              </div>
              
              <div className="flex-1 overflow-auto p-4 space-y-6">
                {/* AI Suggestions Card */}
                <div className="bg-linear-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-2xl p-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Brain size={48} />
                  </div>
                  <div className="flex items-center gap-2 mb-3 font-black text-[10px] uppercase tracking-wider text-blue-400">
                    <Zap size={14} className="fill-current" />
                    Real-time Logic Check
                  </div>
                  <p className="text-xs leading-relaxed text-blue-100/70">
                    You're implementing a <strong>Binary Search</strong>. Don't forget to handle the edge case where the array is empty.
                  </p>
                  <button className="mt-4 text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                    EXPAND LOGIC <CheckCircle2 size={12} />
                  </button>
                </div>

                {/* Private Notes (Interview Mode ONLY) */}
                {mode === 'interview' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black tracking-widest opacity-40">
                      <StickyNote size={12} /> PRIVATE EVALUATOR NOTES
                    </div>
                    <textarea 
                      placeholder="Take private interviewer notes here..."
                      className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder:opacity-20 resize-none font-medium text-white/80"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                       <button className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10">GENERATE RUBRIC</button>
                       <button className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10">AI EVALUATION</button>
                    </div>
                  </div>
                )}

                {/* Help Section */}
                <div className="pt-6 border-t border-white/5">
                   <div className="text-[10px] font-black tracking-widest opacity-40 mb-4 uppercase">Collaboration Guide</div>
                   <div className="space-y-3">
                      {[
                        { icon: <RotateCcw size={12} />, text: "Sync cursor to follow active speaker" },
                        { icon: <FastForward size={12} />, text: "Reveal solution step-by-step" },
                        { icon: <HelpCircle size={12} />, text: "Request AI debug report" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-[11px] opacity-60 hover:opacity-100 cursor-pointer transition-opacity group">
                          <div className="p-1 px-1.5 rounded bg-white/5 text-blue-400 group-hover:bg-blue-400 group-hover:text-black transition-all">
                            {item.icon}
                          </div>
                          {item.text}
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* AI Chat Input Box */}
              <div className="p-4 border-t border-white/5 bg-[#050505]">
                <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="Ask CodeSync AI..." 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:opacity-30 pr-12 transition-all"
                  />
                  <button className="absolute right-2 top-2 bg-blue-600 p-1.5 rounded-xl text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 active:scale-90 transition-all">
                    <MessageSquare size={16} />
                  </button>
                </div>
                <div className="mt-2 flex justify-between items-center text-[9px] font-bold opacity-30 tracking-tight">
                  <span className="flex items-center gap-1"><Brain size={10} /> LLAMA 3.1 TURBO</span>
                  <span>PRESS ⌘+K FOR CMDS</span>
                </div>
              </div>
            </aside>
          )}
        </main>
      </div>
    </div>
  );
}
