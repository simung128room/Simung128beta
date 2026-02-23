import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SystemDialogueProps {
  onAccept: () => void;
  onDecline: () => void;
}

export const SystemDialogue: React.FC<SystemDialogueProps> = ({ onAccept, onDecline }) => {
  const [text, setText] = useState('');
  const fullText = 'Do you want to start the quest?';
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 50);
    
    // Play a subtle "beep" sound for typing if possible
    const playBeep = () => {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    };

    const soundInterval = setInterval(() => {
      if (i <= fullText.length) playBeep();
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(soundInterval);
    };
  }, []);

  const playClick = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md"
      >
        {/* Glowing Border Effect */}
        <div className="absolute -inset-1 bg-blue-500 rounded-lg blur opacity-30 animate-pulse"></div>
        
        <div className="relative bg-[#0a0f1e] border-2 border-blue-500/50 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.2)]">
          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10 opacity-20"></div>
          
          {/* Header */}
          <div className="bg-blue-500/10 border-b border-blue-500/30 px-4 py-2 flex items-center justify-between">
            <span className="text-white font-mono font-black tracking-[0.2em] text-sm">[SYSTEM]</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 flex flex-col items-center text-center gap-8">
            <div className="min-h-[3rem] flex items-center justify-center">
              <p className="text-white text-lg font-medium tracking-wide leading-relaxed">
                {text}
                <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse"></span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <button
                onClick={() => { playClick(); onAccept(); }}
                className="group relative py-3 px-6 bg-blue-500/10 border border-blue-500/50 rounded-md overflow-hidden transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative text-blue-400 group-hover:text-white font-black tracking-widest italic">YES</span>
              </button>
              
              <button
                onClick={() => { playClick(); onDecline(); }}
                className="group relative py-3 px-6 bg-slate-800/50 border border-slate-700 rounded-md overflow-hidden transition-all hover:bg-slate-700"
              >
                <span className="relative text-slate-400 group-hover:text-white font-black tracking-widest italic">NO</span>
              </button>
            </div>
          </div>

          {/* Footer Decoration */}
          <div className="h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        </div>
      </motion.div>
    </div>
  );
};
