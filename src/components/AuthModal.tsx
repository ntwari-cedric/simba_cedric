import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function AuthModal() {
  const { isLoginModalOpen, closeLoginModal, loginWithGoogle, signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isLoginModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLoginModal}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl w-full max-w-sm overflow-hidden pointer-events-auto border border-zinc-100 dark:border-zinc-800">
              <div className="relative p-6 pt-10 pb-10">
                <button 
                  onClick={closeLoginModal}
                  className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 p-2 shadow-sm ring-1 ring-zinc-100">
                    <img src="/simba_log_image.png" alt="Simba Logo" className="w-full h-full object-contain" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">{isSignUp ? t("auth.create_account") : t("auth.welcome")}</h2>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs max-w-[240px]">{t("auth.subtitle")}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                  <div>
                    <input 
                      type="email" 
                      placeholder={t("auth.email_address")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-orange-500 text-sm font-medium transition-all"
                    />
                  </div>
                  <div>
                    <input 
                      type="password" 
                      placeholder={t("auth.password")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-orange-500 text-sm font-medium transition-all"
                    />
                  </div>
                  {error && <p className="text-[10px] text-red-500 font-bold">{error}</p>}
                  <button
                    disabled={loading}
                    className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20 disabled:opacity-50"
                  >
                    {loading ? t("auth.processing") : (isSignUp ? t("auth.sign_up") : t("nav.sign_in"))}
                  </button>
                </form>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-zinc-100 dark:border-zinc-800"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold">
                      <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-400">{t("auth.or_continue_with")}</span>
                    </div>
                  </div>

                  <button
                    onClick={loginWithGoogle}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 transition-all text-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.23.81-.6z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    </svg>
                    {t("auth.google_account")}
                  </button>
                  
                  <p className="text-center text-[10px] text-zinc-500 font-bold">
                    {isSignUp ? t("auth.already_have_account") : t("auth.dont_have_account")}
                    <button 
                      onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                      className="ml-1 text-orange-600 hover:underline"
                    >
                      {isSignUp ? t("nav.sign_in") : t("auth.sign_up")}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
