import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { Search, Map, Wind, Layers, Zap, Loader2, FileText } from 'lucide-react';

export const LandAnalysis: React.FC = () => {
  const { t } = useLanguage();
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyzeLand = async () => {
    if (!location) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following land/dungeon location for a Solo Leveling RPG system: "${location}". 
        Determine the soil type (environment), structure (layout difficulty), mana density, and a strategic recommendation.
        Respond in JSON format.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              soilType: { type: Type.STRING },
              structure: { type: Type.STRING },
              manaDensity: { type: Type.STRING },
              recommendation: { type: Type.STRING },
            },
            required: ["soilType", "structure", "manaDensity", "recommendation"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/50 rounded-2xl text-blue-400">
        <Map size={24} />
        <h2 className="text-xl font-black uppercase italic">{t.landAnalysis}</h2>
      </div>

      <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Enter Location or Gate Signature..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <button
          onClick={analyzeLand}
          disabled={loading || !location}
          className="w-full py-4 rounded-xl bg-blue-500 text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
          {loading ? t.analyzing : t.analyze}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                  <Wind size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.soilType}</span>
                  <span className="text-white font-bold">{result.soilType}</span>
                </div>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Layers size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.structure}</span>
                  <span className="text-white font-bold">{result.structure}</span>
                </div>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                  <Zap size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.manaDensity}</span>
                  <span className="text-white font-bold">{result.manaDensity}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-blue-400">
                <FileText size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest">{t.recommendation}</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic">
                "{result.recommendation}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
