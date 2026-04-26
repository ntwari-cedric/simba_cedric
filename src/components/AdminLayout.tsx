import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  PackageSearch, 
  ShoppingBag, 
  Tags, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Basic guard
  React.useEffect(() => {
    if (!isAdmin && user) {
      navigate('/');
    } else if (!user && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!isAdmin) return null;

  const navItems = [
    { name: t("admin.dashboard"), path: '/admin', icon: LayoutDashboard },
    { name: t("admin.nav_orders"), path: '/admin/orders', icon: ShoppingBag },
    { name: t("admin.pricing"), path: '/admin/products', icon: PackageSearch },
    { name: t("admin.stock"), path: '/admin/stock', icon: Tags },
    { name: t("admin.users"), path: '/admin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex font-sans text-zinc-900 dark:text-zinc-100">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-zinc-900/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : 0 }}
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-20 flex items-center px-8 bg-[#F26C24] text-white">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 mr-3 shadow-sm">
            <img src="/simba_log_image.png" alt="Simba" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold tracking-tight">{t("admin.panel_title")}</span>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                  isActive
                    ? 'bg-orange-50 dark:bg-orange-500/10 text-[#F26C24] dark:text-orange-500'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
          <button className="flex w-full items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <Settings className="w-5 h-5" />
            {t("admin.settings")}
          </button>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {t("nav.logout")}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-20 bg-[#F26C24] text-white shadow-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl hover:bg-white/10 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-full border border-white/20 focus-within:border-white/50 focus-within:bg-white/20 transition-all w-80">
              <Search className="w-4 h-4 text-orange-100" />
              <input 
                type="text" 
                placeholder={t("admin.search_placeholder")}
                className="bg-transparent border-none outline-none text-sm w-full font-medium text-white placeholder:text-orange-100/70"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2.5 text-orange-50 hover:text-white rounded-full hover:bg-white/10 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-white rounded-full ring-2 ring-[#F26C24]"></span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2.5 text-orange-50 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <div className="h-8 w-px bg-white/20 mx-2 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-white leading-tight">{user?.displayName || 'Admin'}</p>
                <p className="text-[10px] font-bold text-orange-100 uppercase tracking-wider">{t("nav.super_admin")}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white text-[#F26C24] flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                {(user?.displayName?.[0] || 'A').toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
