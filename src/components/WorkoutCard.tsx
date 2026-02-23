import React from 'react';
import { Exercise, Set } from '../types';
import { SetItem } from './SetItem';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

interface WorkoutCardProps {
  exercise: Exercise;
  onUpdate: (updates: Partial<Exercise>) => void;
  onDelete: () => void;
  onQuickAdd: () => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ exercise, onUpdate, onDelete, onQuickAdd }) => {
  const { t } = useLanguage();

  const addSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: Set = {
      id: Math.random().toString(36).substr(2, 9),
      weight: lastSet ? lastSet.weight : 0,
      reps: lastSet ? lastSet.reps : 0,
      completed: false,
    };
    onUpdate({ sets: [...exercise.sets, newSet] });
  };

  const updateSet = (setId: string, updates: Partial<Set>) => {
    onUpdate({
      sets: exercise.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
    });
  };

  const deleteSet = (setId: string) => {
    onUpdate({
      sets: exercise.sets.filter((s) => s.id !== setId),
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
    >
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
        <input
          type="text"
          value={exercise.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder={t.exerciseName}
          className="bg-transparent border-none focus:ring-0 text-lg font-bold text-white placeholder:text-slate-600 w-full"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={onQuickAdd}
            title={t.quickAdd}
            className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {exercise.sets.map((set, idx) => (
            <SetItem
              key={set.id}
              set={set}
              index={idx}
              onUpdate={(updates) => updateSet(set.id, updates)}
              onDelete={() => deleteSet(set.id)}
            />
          ))}
        </AnimatePresence>

        <button
          onClick={addSet}
          className="w-full py-4 rounded-xl border-2 border-dashed border-slate-700 text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2 font-bold mt-2"
        >
          <Plus size={20} />
          {t.addSet}
        </button>
      </div>
    </motion.div>
  );
};
