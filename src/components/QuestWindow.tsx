import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Quest } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Trophy, Star } from 'lucide-react';

interface QuestWindowProps {
  quests: Quest[];
  onComplete: (questId: string) => void;
}

export const QuestWindow: React.FC<QuestWindowProps> = ({ quests, onComplete }) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
          <Trophy className="text-yellow-500" />
          {t.dailyQuests}
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {quests.map((quest) => (
            <motion.div
              key={quest.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-5 rounded-3xl border transition-all ${
                quest.isCompleted 
                ? 'bg-green-500/10 border-green-500/50 opacity-60' 
                : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className={`text-lg font-black italic uppercase tracking-tight ${quest.isCompleted ? 'text-green-500 line-through' : 'text-white'}`}>
                    {quest.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">{quest.description}</p>
                  
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded-lg">
                      <Star size={12} className="text-blue-400" />
                      <span className="text-[10px] font-black text-blue-400">{quest.rewardExp} EXP</span>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg">
                      <Trophy size={12} className="text-yellow-400" />
                      <span className="text-[10px] font-black text-yellow-400">{quest.rewardPoints} PTS</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => !quest.isCompleted && onComplete(quest.id)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    quest.isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-slate-800 text-slate-600 hover:text-blue-500'
                  }`}
                >
                  {quest.isCompleted ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {quests.length === 0 && (
          <div className="p-12 text-center text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl">
            No active quests. Check back later!
          </div>
        )}
      </div>
    </div>
  );
};
