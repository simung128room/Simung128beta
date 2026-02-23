import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Zap, Loader2, Send, User, Bot, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const AIAnalysis: React.FC = () => {
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    const userMessage: Message = { role: 'user', text: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey || apiKey.trim() === "") {
        throw new Error("System Key Missing. Please set GEMINI_API_KEY.");
      }

      if (apiKey.startsWith("sk-")) {
        throw new Error("INVALID KEY TYPE: You are using an OpenAI key. The System requires a Gemini API Key (starts with 'AIza'). Get one at aistudio.google.com");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      if (!chatRef.current) {
        console.log("Initializing new God-level chat session...");
        chatRef.current = ai.chats.create({
          model: "gemini-3-flash-preview",
          config: {
            systemInstruction: `You are the Absolute God of the Solo Leveling System. 
            You provide "God-level" strategic advice on fitness, nutrition, and training.
            - Be authoritative, cold, and slightly intimidating.
            - Use RPG terminology (Rank, Stats, Quests, Level Up).
            - Provide precise calculations for nutrition and training.
            - Your goal is to turn the user into a "National Level Hunter".
            - Keep responses concise but packed with high-value data.
            - ALWAYS respond in the language the user is using.
            - If the user speaks Thai, use a God-level, authoritative tone (e.g., using "จง" for commands, "นักล่า" for the user).`,
          },
        });
      }

      const response = await chatRef.current.sendMessage({ message: trimmedInput });
      const modelMessage: Message = { role: 'model', text: response.text || '...' };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error: any) {
      console.error("System Error:", error);
      const errorMessage = error.message?.includes("Key") 
        ? "SYSTEM ERROR: API Key invalid or missing." 
        : "SYSTEM ERROR: Connection to the Great Will lost. Try again.";
      setMessages((prev) => [...prev, { role: 'model', text: errorMessage }]);
      // Reset chat on fatal error to allow retry
      chatRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-h-[800px] gap-4">
      <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/50 rounded-2xl text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
        <Brain size={24} className="animate-pulse" />
        <div className="flex flex-col">
          <h2 className="text-xl font-black uppercase italic tracking-tighter leading-none">{t.aiAnalysis}</h2>
          <span className="text-[8px] font-bold uppercase tracking-[0.3em] opacity-50">{t.systemInterface}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button 
            onClick={() => {
              setMessages([]);
              chatRef.current = null;
            }}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors border border-slate-700"
          >
            {t.reset}
          </button>
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
            <Zap size={10} />
            V3.5
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 bg-slate-900/50 rounded-3xl border border-slate-800 flex flex-col gap-4 scrollbar-hide"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 opacity-50">
            <Sparkles size={48} className="text-blue-500" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-black uppercase tracking-[0.2em]">{t.awaitingInput}</p>
              <p className="text-xs italic">"{t.hunterObjectives}"</p>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-blue-400 border border-blue-500/30'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700'
              }`}>
                <div className="markdown-body prose prose-invert prose-sm max-w-none">
                  <Markdown>{msg.text}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Loader2 size={16} className="animate-spin" />
            </div>
            <div className="bg-slate-800/80 p-4 rounded-2xl rounded-tl-none border border-slate-700">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder={t.enterCommand}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl py-4 pl-6 pr-16 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-xl"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-blue-600 text-white disabled:opacity-50 transition-all hover:bg-blue-500 active:scale-95"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};
