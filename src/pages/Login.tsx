import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
  const { signIn, signUp, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, from);
      } else {
        await signIn(email, password, from);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle(from);
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl border border-zinc-100 dark:border-zinc-800 p-8 sm:p-12"
      >
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">{t("auth.back")}</span>
        </button>

        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 p-4 shadow-sm ring-1 ring-zinc-100">
            <img src="/simba_log_image.png" alt="Simba Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">
            {isSignUp ? t("auth.join_simba") : t("auth.welcome")}
          </h1>
          <p className="text-zinc-500 font-medium">{t("auth.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder={t("auth.email_address")}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-orange-500 font-bold transition-all"
          />
          <input 
            type="password" 
            placeholder={t("auth.password")}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-orange-500 font-bold transition-all"
          />
          
          {error && <p className="text-xs text-red-500 font-bold ml-2">{error}</p>}

          <button 
            disabled={loading}
            className="w-full py-5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-xl shadow-orange-600/20 transition-all uppercase tracking-widest text-sm disabled:opacity-50"
          >
            {loading ? t("auth.processing") : (isSignUp ? t("auth.create_account") : t("nav.sign_in"))}
          </button>
        </form>

        <div className="my-10 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-100 dark:border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-zinc-400">
            <span className="bg-white dark:bg-zinc-900 px-4">{t("auth.or_continue_with")}</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full py-4 px-6 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl flex items-center justify-center gap-3 font-bold text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.23.81-.6z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          </svg>
          {t("auth.google_account")}
        </button>

        <p className="mt-10 text-center text-sm font-bold text-zinc-500">
          {isSignUp ? t("auth.already_have_account") : t("auth.dont_have_account")}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-2 text-orange-600 hover:underline"
          >
            {isSignUp ? t("nav.sign_in") : t("auth.sign_up")}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
