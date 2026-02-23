import React from 'react';
import { Plus, Minus, Check, Trash2 } from 'lucide-react';
import { Set } from '../types';
import { motion } from 'motion/react';

interface SetItemProps {
  set: Set;
  index: number;
  onUpdate: (updates: Partial<Set>) => void;
  onDelete: () => void;
}

export const SetItem: React.FC<SetItemProps> = ({ set, index, onUpdate, onDelete }) => {
  const adjustWeight = (val: number) => onUpdate({ weight: Math.max(0, set.weight + val) });
  const adjustReps = (val: number) => onUpdate({ reps: Math.max(0, set.reps + val) });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
        set.completed ? 'bg-green-500/10 border-green-500/50' : 'bg-slate-800/50 border-slate-700'
      }`}
    >
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-slate-300">
        {index + 1}
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4">
        {/* Weight Control */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Weight</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustWeight(-2.5)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 active:scale-90 transition-transform"
            >
              <Minus size={14} />
            </button>
            <span className="flex-1 text-center font-mono font-bold text-lg">{set.weight}</span>
            <button
              onClick={() => adjustWeight(2.5)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 active:scale-90 transition-transform"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Reps Control */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Reps</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustReps(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 active:scale-90 transition-transform"
            >
              <Minus size={14} />
            </button>
            <span className="flex-1 text-center font-mono font-bold text-lg">{set.reps}</span>
            <button
              onClick={() => adjustReps(1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 active:scale-90 transition-transform"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => onUpdate({ completed: !set.completed })}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
            set.completed ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'
          }`}
        >
          <Check size={20} />
        </button>
        <button
          onClick={onDelete}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};
