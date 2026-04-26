import React from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Globe, ShoppingCart, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../lib/i18n';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, openLoginModal, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { language, setLanguage, t } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 bg-[#F26C24] dark:bg-zinc-900 shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Left: Logo & Branding (matching the uploaded image) */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative flex items-center justify-center w-12 h-12 bg-white rounded-full p-1 shadow-sm shrink-0 overflow-hidden">
               {/* User uploads this image to public/simba_log_image.png */}
               <img src="/simba_log_image.png" alt="Simba logo" className="w-full h-full object-contain" onError={(e) => {
                 (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Simba&background=F26C24&color=fff&rounded=true&bold=true';
               }} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white leading-tight font-serif tracking-wide">{t("app.title")}</h1>
              <p className="text-sm text-orange-100 dark:text-zinc-400 font-medium">{t("nav.online_shopping")}</p>
            </div>
          </Link>

          {/* Center: Empty Space */}
          <div className="flex-1 hidden md:block"></div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link
              to="/search"
              className="p-2 text-white/90 hover:text-white dark:text-zinc-400 dark:hover:text-zinc-100 rounded-full hover:bg-white/10 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 text-white/90 hover:text-white dark:text-zinc-400 dark:hover:text-zinc-100 rounded-full hover:bg-white/10 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            <div className="relative group/lang hidden sm:block">
              <button className="flex items-center gap-1.5 p-2 text-white/90 hover:text-white dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg hover:bg-white/10 dark:hover:bg-zinc-800 transition-colors text-sm font-semibold">
                <Globe className="h-4 w-4" />
                {language}
              </button>
              <div className="absolute right-0 mt-2 w-24 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all overflow-hidden transform origin-top group-hover/lang:scale-100 scale-95 duration-200">
                <div className="py-1 flex flex-col">
                  {(['EN', 'FR', 'KIN'] as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={`px-4 py-2 text-sm text-left hover:bg-orange-50 dark:hover:bg-zinc-700 transition-colors ${language === l ? 'text-[#F26C24] font-bold dark:text-orange-400' : 'text-zinc-700 dark:text-zinc-300'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {!isAdmin && (
              <Link
                to="/cart"
                className="p-2.5 text-white/90 hover:text-white dark:text-zinc-400 dark:hover:text-zinc-100 rounded-full hover:bg-white/10 dark:hover:bg-zinc-800 transition-all relative group"
                aria-label="View Cart"
              >
                <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#F26C24] dark:bg-orange-600 dark:text-white text-[10px] font-black shadow-sm ring-2 ring-[#F26C24] dark:ring-zinc-900 animate-in zoom-in">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-[10px] font-medium text-white/80 dark:text-zinc-400 leading-tight uppercase tracking-wider">{t("nav.welcome_prefix")}</span>
                  <span className="text-sm font-bold text-white dark:text-zinc-100 leading-tight truncate max-w-[120px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </div>
                <div className="relative group/user">
                  <button className="w-10 h-10 rounded-full border-2 border-white/20 hover:border-white shadow-sm overflow-hidden transition-all bg-white/10 flex items-center justify-center">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-orange-600 text-white font-bold text-sm">
                        {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                      </div>
                    )}
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all overflow-hidden transform origin-top-right group-hover/user:scale-100 scale-95 duration-200 z-[60]">
                    <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{user.displayName || "User"}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="p-1.5 space-y-1">
                      {!isAdmin && (
                        <Link 
                          to="/my-orders" 
                          className="w-full text-left px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-xl transition-colors flex items-center gap-2"
                        >
                          {t("nav.my_orders")}
                        </Link>
                      )}
                      {isAdmin && (
                        <Link 
                          to="/admin/orders" 
                          className="w-full text-left px-4 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-xl transition-colors flex items-center gap-2"
                        >
                          {t("admin.view_orders")}
                        </Link>
                      )}
                      <button 
                        onClick={logout} 
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors flex items-center gap-2 group/logout"
                      >
                        <span className="group-hover/logout:translate-x-1 transition-transform">{t("nav.logout")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={openLoginModal} className="text-sm font-bold text-[#F26C24] dark:text-orange-500 bg-white dark:bg-zinc-800 px-5 py-2.5 rounded-full hover:bg-orange-50 dark:hover:bg-zinc-700 hover:scale-105 transition-all shadow-sm">
                {t("nav.sign_in")}
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile Search (Removed per user request) */}
      </div>
    </nav>
  );
}
