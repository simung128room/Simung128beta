import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Quest, User } from '../types';
import { Plus, Trash2, ShieldAlert, Users, Ban, CheckCircle, Loader2 } from 'lucide-react';

interface AdminPanelProps {
  quests: Quest[];
  onCreateQuest: (quest: Omit<Quest, 'id' | 'isCompleted'>) => void;
  onDeleteQuest: (id: string) => void;
  currentUser: User;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ quests, onCreateQuest, onDeleteQuest, currentUser }) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [exp, setExp] = useState(100);
  const [pts, setPts] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`/api/admin/users?username=${currentUser.username}`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleBan = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to toggle ban', err);
    }
  };

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

      {/* User Management Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Users size={18} />
          <h3 className="text-xs font-black uppercase tracking-widest">{t.userManagement}</h3>
        </div>

        <div className="bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden">
          {loadingUsers ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-500" size={24} />
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {users.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-bold text-white flex items-center gap-2">
                      {u.username}
                      {u.isAdmin && <ShieldAlert size={12} className="text-red-500" />}
                      {u.isBanned && <span className="text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded uppercase font-black">{t.banned}</span>}
                    </span>
                    <span className="text-xs text-slate-500">{u.email}</span>
                  </div>
                  
                  {!u.isAdmin && (
                    <button
                      onClick={() => toggleBan(u.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                        u.isBanned 
                          ? 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white' 
                          : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      {u.isBanned ? <CheckCircle size={14} /> : <Ban size={14} />}
                      {u.isBanned ? t.unban : t.ban}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
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
