import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CharacterStats } from '../types';
import { motion } from 'motion/react';
import { Shield, Zap, Heart, Brain, ChevronUp } from 'lucide-react';

interface CharacterProfileProps {
  stats: CharacterStats;
  onUpgrade: (stat: keyof CharacterStats) => void;
}

export const CharacterProfile: React.FC<CharacterProfileProps> = ({ stats, onUpgrade }) => {
  const { t } = useLanguage();

  const expProgress = (stats.exp / stats.nextLevelExp) * 100;

  const statItems = [
    { key: 'strength', label: t.strength, icon: Shield, color: 'text-red-500', bg: 'bg-red-500/10' },
    { key: 'agility', label: t.agility, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { key: 'stamina', label: t.stamina, icon: Heart, color: 'text-green-500', bg: 'bg-green-500/10' },
    { key: 'intelligence', label: t.intelligence, icon: Brain, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Level Card */}
      <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Shield size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-black text-white italic">LV.{stats.level}</span>
            <span className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">Rank E</span>
          </div>
          
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-1">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${expProgress}%` }}
              className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            />
          </div>
          <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-tighter">
            <span>EXP</span>
            <span>{stats.exp} / {stats.nextLevelExp}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-3">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">{t.character} Stats</h3>
          {stats.points > 0 && (
            <span className="text-xs font-black text-blue-400 animate-pulse">
              {stats.points} {t.availablePoints}
            </span>
          )}
        </div>

        {statItems.map((item) => (
          <div key={item.key} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color}`}>
                <item.icon size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                <span className="text-xl font-black text-white">{(stats as any)[item.key]}</span>
              </div>
            </div>
            
            {stats.points > 0 && (
              <button
                onClick={() => onUpgrade(item.key as keyof CharacterStats)}
                className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-90 transition-all"
              >
                <ChevronUp size={24} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
