import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { BookOpen, Target, Utensils, Zap, Shield, ChevronRight } from 'lucide-react';

export const FitnessGuide: React.FC = () => {
  const { t } = useLanguage();

  const sections = [
    {
      id: 'body',
      title: t.bodyComp,
      icon: <Target className="text-blue-400" size={20} />,
      content: t.guideBodyContent
    },
    {
      id: 'nutrition',
      title: t.nutrition,
      icon: <Utensils className="text-green-400" size={20} />,
      content: t.guideNutritionContent
    },
    {
      id: 'strategy',
      title: t.workoutStrategy,
      icon: <Zap className="text-yellow-400" size={20} />,
      content: t.guideStrategyContent
    },
    {
      id: 'equipment',
      title: t.equipment,
      icon: <Shield className="text-purple-400" size={20} />,
      content: t.guideEquipmentContent
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/50 rounded-2xl text-blue-400">
        <BookOpen size={24} />
        <h2 className="text-xl font-black uppercase italic">{t.guide}</h2>
      </div>

      <div className="flex flex-col gap-4">
        {sections.map((section, idx) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden"
          >
            <div className="p-4 bg-slate-800/30 border-b border-slate-800 flex items-center gap-3">
              {section.icon}
              <h3 className="font-black uppercase tracking-widest text-sm text-white">{section.title}</h3>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {section.content.map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <ChevronRight size={14} className="text-blue-500 mt-1 shrink-0" />
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 text-center">
        <p className="text-xs text-blue-400/60 font-bold uppercase tracking-[0.2em]">
          {t.guideQuote}
        </p>
      </div>
    </div>
  );
};
