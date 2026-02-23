import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0f172a]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex flex-col items-center mb-8">
          <img 
            src="https://img2.pic.in.th/IMG_44988ca86641a4be73f2.jpeg" 
            alt="Logo" 
            className="w-20 h-20 rounded-2xl mb-4 object-cover shadow-lg shadow-blue-500/20"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-2xl font-black text-white uppercase tracking-tight italic">
            {isLogin ? t.login : t.register}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{isLogin ? t.welcome : t.newWorkout}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder={t.username}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="email"
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="password"
              placeholder={t.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-red-500 text-xs font-bold text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-blue-500 text-white font-black text-lg shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : isLogin ? (
              <>
                <LogIn size={20} strokeWidth={3} />
                {t.login}
              </>
            ) : (
              <>
                <UserPlus size={20} strokeWidth={3} />
                {t.register}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-400 text-sm hover:text-blue-400 transition-colors"
          >
            {isLogin ? t.noAccount : t.haveAccount}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
