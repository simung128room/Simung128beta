/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, Save, X, History as HistoryIcon, LayoutDashboard, LogOut, Trophy, User as UserIcon, ShieldAlert, BookOpen, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageToggle } from './components/LanguageToggle';
import { WorkoutCard } from './components/WorkoutCard';
import { Dashboard } from './components/Dashboard';
import { AuthScreen } from './components/AuthScreen';
import { CharacterProfile } from './components/CharacterProfile';
import { QuestWindow } from './components/QuestWindow';
import { AdminPanel } from './components/AdminPanel';
import { AIAnalysis } from './components/AIAnalysis';
import { FitnessGuide } from './components/FitnessGuide';
import { WorkoutSession, Exercise, CharacterStats, Quest } from './types';

import { SystemDialogue } from './components/SystemDialogue';

function WorkoutApp() {
  const { t } = useLanguage();
  const { user, logout, isLoading } = useAuth();
  const [view, setView] = useState<'dashboard' | 'active' | 'history' | 'character' | 'quests' | 'admin' | 'ai' | 'guide'>('dashboard');
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [showIntro, setShowIntro] = useState(() => {
    return !localStorage.getItem('workout-intro-seen');
  });
  
  // Gamification State
  const [stats, setStats] = useState<CharacterStats>(() => {
    const saved = localStorage.getItem('workout-stats');
    return saved ? JSON.parse(saved) : {
      level: 1,
      exp: 0,
      nextLevelExp: 1000,
      points: 0,
      strength: 10,
      agility: 10,
      stamina: 10,
      intelligence: 10,
    };
  });

  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    fetch('/api/quests')
      .then(res => res.json())
      .then(data => setQuests(data))
      .catch(err => console.error('Failed to fetch quests', err));
  }, []);

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`workout-sessions-${user.id}`);
      setSessions(saved ? JSON.parse(saved) : []);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`workout-sessions-${user.id}`, JSON.stringify(sessions));
    }
  }, [sessions, user]);

  useEffect(() => {
    localStorage.setItem('workout-stats', JSON.stringify(stats));
  }, [stats]);

  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [exerciseSearch, setExerciseSearch] = useState('');

  const previousExerciseNames = React.useMemo(() => {
    const names = new Set<string>();
    sessions.forEach(s => s.exercises.forEach(ex => {
      if (ex.name) names.add(ex.name);
    }));
    // Default suggestions if history is empty
    if (names.size === 0) {
      ['Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Barbell Row', 'Pull Ups', 'Push Ups', 'Dips'].forEach(n => names.add(n));
    }
    return Array.from(names).sort();
  }, [sessions]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const startNewWorkout = () => {
    const newSession: WorkoutSession = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      exercises: [],
    };
    setActiveSession(newSession);
    setExerciseSearch('');
    setView('active');
  };

  const addExercise = () => {
    if (!activeSession) return;
    const newExercise: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      sets: [],
    };
    setActiveSession({
      ...activeSession,
      exercises: [...activeSession.exercises, newExercise],
    });
  };

  const updateExercise = (exerciseId: string, updates: Partial<Exercise>) => {
    if (!activeSession) return;
    setActiveSession({
      ...activeSession,
      exercises: activeSession.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, ...updates } : ex
      ),
    });
  };

  const deleteExercise = (exerciseId: string) => {
    if (!activeSession) return;
    setActiveSession({
      ...activeSession,
      exercises: activeSession.exercises.filter((ex) => ex.id !== exerciseId),
    });
  };

  const quickAddPrevious = (exerciseId: string) => {
    if (!activeSession) return;
    const currentEx = activeSession.exercises.find((ex) => ex.id === exerciseId);
    if (!currentEx) return;

    const lastSessionWithEx = sessions.find((s) =>
      s.exercises.some((ex) => ex.name.toLowerCase() === currentEx.name.toLowerCase())
    );

    if (lastSessionWithEx) {
      const prevEx = lastSessionWithEx.exercises.find(
        (ex) => ex.name.toLowerCase() === currentEx.name.toLowerCase()
      );
      if (prevEx) {
        updateExercise(exerciseId, {
          sets: prevEx.sets.map((s) => ({
            ...s,
            id: Math.random().toString(36).substr(2, 9),
            completed: false,
          })),
        });
      }
    }
  };

  const saveWorkout = () => {
    if (!activeSession) return;
    
    // Calculate rewards
    let totalVolume = 0;
    let totalSets = 0;
    activeSession.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.completed) {
          totalVolume += s.weight * s.reps;
          totalSets++;
        }
      });
    });

    // Base rewards
    const gainedExp = Math.floor(totalVolume / 10) + (totalSets * 50);
    addExp(gainedExp);

    setSessions([activeSession, ...sessions]);
    setActiveSession(null);
    setView('dashboard');
  };

  const addExp = (amount: number) => {
    setStats(prev => {
      let newExp = prev.exp + amount;
      let newLevel = prev.level;
      let newNextExp = prev.nextLevelExp;
      let newPoints = prev.points;

      while (newExp >= newNextExp) {
        newExp -= newNextExp;
        newLevel++;
        newNextExp = Math.floor(newNextExp * 1.2);
        newPoints += 5;
      }

      return { ...prev, exp: newExp, level: newLevel, nextLevelExp: newNextExp, points: newPoints };
    });
  };

  const upgradeStat = (stat: keyof CharacterStats) => {
    if (stats.points <= 0) return;
    setStats(prev => ({
      ...prev,
      points: prev.points - 1,
      [stat]: (prev[stat] as number) + 1
    }));
  };

  const completeQuest = (id: string) => {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.isCompleted) return;

    setQuests(prev => prev.map(q => q.id === id ? { ...q, isCompleted: true } : q));
    addExp(quest.rewardExp);
    setStats(prev => ({ ...prev, points: prev.points + quest.rewardPoints }));
  };

  const createQuest = async (newQuest: Omit<Quest, 'id' | 'isCompleted'>) => {
    if (!user || user.username !== 'ooD7822429') return;
    try {
      const res = await fetch('/api/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newQuest, username: user.username }),
      });
      const quest = await res.json();
      setQuests(prev => [quest, ...prev]);
    } catch (err) {
      console.error('Failed to create quest', err);
    }
  };

  const deleteQuest = async (id: string) => {
    if (!user || user.username !== 'ooD7822429') return;
    try {
      await fetch(`/api/quests/${id}?username=${user.username}`, { method: 'DELETE' });
      setQuests(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      console.error('Failed to delete quest', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans pb-24">
      <AnimatePresence>
        {showIntro && (
          <SystemDialogue 
            onAccept={() => {
              setShowIntro(false);
              localStorage.setItem('workout-intro-seen', 'true');
            }}
            onDecline={() => {
              setShowIntro(false);
              localStorage.setItem('workout-intro-seen', 'true');
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="https://img2.pic.in.th/IMG_44988ca86641a4be73f2.jpeg" 
            alt="Logo" 
            className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-blue-500/20 cursor-pointer"
            onClick={() => setView('dashboard')}
            referrerPolicy="no-referrer"
          />
          <h1 className="text-xl font-black tracking-tight text-white uppercase italic hidden sm:block">
            {t.title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <LanguageToggle />
          {user.username === 'ooD7822429' && (
            <button
              onClick={() => setView('admin')}
              className={`p-2 rounded-xl transition-colors ${view === 'admin' ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'}`}
              title={t.admin}
            >
              <ShieldAlert size={20} />
            </button>
          )}
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
            title={t.logout}
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-6">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-500 text-xs font-black uppercase tracking-widest">{t.welcome}</span>
                  <h2 className="text-2xl font-black text-white">{user.username}</h2>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Rank E</span>
                  <span className="text-xl font-black text-white italic">LV.{stats.level}</span>
                </div>
              </div>

              <Dashboard sessions={sessions} />
              
              <button
                onClick={startNewWorkout}
                className="w-full py-5 rounded-2xl bg-blue-500 text-white font-black text-lg shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Plus size={24} strokeWidth={3} />
                {t.newWorkout}
              </button>

              {sessions.length > 0 && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <HistoryIcon size={14} />
                    {t.history}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {sessions.slice(0, 3).map((session) => (
                      <div
                        key={session.id}
                        className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">
                            {new Date(session.date).toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">
                            {session.exercises.length} Exercises
                          </span>
                        </div>
                        <div className="flex -space-x-2">
                          {session.exercises.slice(0, 3).map((ex, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold"
                            >
                              {ex.name.charAt(0).toUpperCase()}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {view === 'active' && activeSession && (
            <motion.div
              key="active"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">{t.newWorkout}</h2>
                <button
                  onClick={() => {
                    if (confirm('Cancel workout?')) {
                      setActiveSession(null);
                      setView('dashboard');
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <HistoryIcon size={16} />
                </div>
                <input
                  type="text"
                  placeholder={t.searchExercises}
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-6">
                <AnimatePresence mode="popLayout">
                  {activeSession.exercises
                    .filter(ex => !exerciseSearch || ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()))
                    .map((exercise) => (
                      <WorkoutCard
                        key={exercise.id}
                        exercise={exercise}
                        onUpdate={(updates) => updateExercise(exercise.id, updates)}
                        onDelete={() => deleteExercise(exercise.id)}
                        onQuickAdd={() => quickAddPrevious(exercise.id)}
                        suggestions={previousExerciseNames}
                      />
                    ))}
                </AnimatePresence>

                <button
                  onClick={addExercise}
                  className="w-full py-5 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 text-slate-500 font-bold flex items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-all"
                >
                  <Plus size={20} />
                  {t.addExercise}
                </button>

                <button
                  onClick={saveWorkout}
                  disabled={activeSession.exercises.length === 0}
                  className="w-full py-5 rounded-2xl bg-green-500 text-white font-black text-lg shadow-xl shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                >
                  <Save size={24} strokeWidth={3} />
                  {t.save}
                </button>
              </div>
            </motion.div>
          )}

          {view === 'character' && (
            <motion.div
              key="character"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <CharacterProfile stats={stats} onUpgrade={upgradeStat} />
            </motion.div>
          )}

          {view === 'quests' && (
            <motion.div
              key="quests"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <QuestWindow quests={quests} onComplete={completeQuest} />
            </motion.div>
          )}

          {view === 'admin' && user && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AdminPanel 
                quests={quests} 
                onCreateQuest={createQuest} 
                onDeleteQuest={deleteQuest} 
                currentUser={user}
              />
            </motion.div>
          )}

          {view === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <AIAnalysis />
            </motion.div>
          )}

          {view === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <FitnessGuide />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f172a]/80 backdrop-blur-xl border-t border-slate-800 px-4 py-4 flex items-center justify-around">
        <button
          onClick={() => setView('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${
            view === 'dashboard' ? 'text-blue-500' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">{t.dashboard}</span>
        </button>
        <button
          onClick={() => setView('character')}
          className={`flex flex-col items-center gap-1 transition-all ${
            view === 'character' ? 'text-blue-500' : 'text-slate-500'
          }`}
        >
          <UserIcon size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">{t.character}</span>
        </button>
        <button
          onClick={() => setView('quests')}
          className={`flex flex-col items-center gap-1 transition-all ${
            view === 'quests' ? 'text-blue-500' : 'text-slate-500'
          }`}
        >
          <Trophy size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">{t.quests}</span>
        </button>
        <button
          onClick={() => setView('ai')}
          className={`flex flex-col items-center gap-1 transition-all ${
            view === 'ai' ? 'text-blue-500' : 'text-slate-500'
          }`}
        >
          <Brain size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">{t.aiAnalysis}</span>
        </button>
        <button
          onClick={() => setView('guide')}
          className={`flex flex-col items-center gap-1 transition-all ${
            view === 'guide' ? 'text-blue-500' : 'text-slate-500'
          }`}
        >
          <BookOpen size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">{t.guide}</span>
        </button>
        <button
          onClick={() => setView('history')}
          className={`flex flex-col items-center gap-1 transition-all ${
            view === 'history' ? 'text-blue-500' : 'text-slate-500'
          }`}
        >
          <HistoryIcon size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">{t.history}</span>
        </button>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <WorkoutApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
