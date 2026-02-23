import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Quest } from '../types';
import { Plus, Trash2, ShieldAlert } from 'lucide-react';

interface AdminPanelProps {
  quests: Quest[];
  onCreateQuest: (quest: Omit<Quest, 'id' | 'isCompleted'>) => void;
  onDeleteQuest: (id: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ quests, onCreateQuest, onDeleteQuest }) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [exp, setExp] = useState(100);
  const [pts, setPts] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !desc) return;
    onCreateQuest({
      title,
      description: desc,
      rewardExp: exp,
      rewardPoints: pts,
      type: 'daily'
    });
    setTitle('');
    setDesc('');
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-500">
        <ShieldAlert size={24} />
        <h2 className="text-xl font-black uppercase italic">{t.admin} System</h2>
      </div>

      {/* Create Quest Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 flex flex-col gap-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">{t.createQuest}</h3>
        
        <input
          type="text"
          placeholder={t.questTitle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <textarea
          placeholder={t.questDesc}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase">EXP {t.reward}</label>
            <input
              type="number"
              value={exp}
              onChange={(e) => setExp(parseInt(e.target.value))}
              className="bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase">PTS {t.reward}</label>
            <input
              type="number"
              value={pts}
              onChange={(e) => setPts(parseInt(e.target.value))}
              className="bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-xl bg-blue-500 text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} />
          {t.createQuest}
        </button>
      </form>

      {/* Quest List */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Active Quests</h3>
        {quests.map((q) => (
          <div key={q.id} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-white">{q.title}</span>
              <span className="text-xs text-slate-500">{q.rewardExp} EXP / {q.rewardPoints} PTS</span>
            </div>
            <button
              onClick={() => onDeleteQuest(q.id)}
              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
