import React, { useMemo } from 'react';
import { WorkoutSession } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, Activity, Weight } from 'lucide-react';

interface DashboardProps {
  sessions: WorkoutSession[];
}

export const Dashboard: React.FC<DashboardProps> = ({ sessions }) => {
  const { t } = useLanguage();

  const stats = useMemo(() => {
    const data = sessions
      .slice()
      .reverse()
      .map((s) => {
        let totalVolume = 0;
        let maxWeight = 0;
        s.exercises.forEach((ex) => {
          ex.sets.forEach((set) => {
            if (set.completed) {
              totalVolume += set.weight * set.reps;
              if (set.weight > maxWeight) maxWeight = set.weight;
            }
          });
        });
        return {
          date: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          volume: totalVolume,
          maxWeight: maxWeight,
        };
      });

    const totalVolume = data.reduce((acc, curr) => acc + curr.volume, 0);
    const avgVolume = data.length ? Math.round(totalVolume / data.length) : 0;
    const peakMaxWeight = Math.max(...data.map((d) => d.maxWeight), 0);

    return { data, totalVolume, avgVolume, peakMaxWeight };
  }, [sessions]);

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
        <Activity size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">{t.noWorkouts}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <TrendingUp size={16} />
            <span className="text-[10px] uppercase font-black tracking-widest">{t.volume}</span>
          </div>
          <span className="text-2xl font-black text-white">{stats.totalVolume.toLocaleString()}</span>
          <span className="text-[10px] text-slate-500 font-bold">AVG: {stats.avgVolume.toLocaleString()}</span>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-green-400 mb-1">
            <Weight size={16} />
            <span className="text-[10px] uppercase font-black tracking-widest">{t.maxWeight}</span>
          </div>
          <span className="text-2xl font-black text-white">{stats.peakMaxWeight} kg</span>
          <span className="text-[10px] text-slate-500 font-bold">ALL TIME PEAK</span>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
          <Activity size={14} className="text-blue-500" />
          {t.volume} Over Time
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.data}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorVolume)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
