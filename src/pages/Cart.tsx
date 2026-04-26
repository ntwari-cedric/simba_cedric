import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Cart() {
  const { items, totalPrice, updateQuantity, removeItem } = useCart();
  const { user, openLoginModal, isAdmin } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (isAdmin) {
      toast.error("Admins cannot place orders", {
        description: "Please use a customer account for shopping."
      });
      return;
    }
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="w-24 h-24 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6"
        >
          <ShoppingBag className="w-12 h-12 text-zinc-300" />
        </motion.div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{t("cart.empty")}</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-xs">{t("search.try_again")}</p>
        <Link 
          to="/" 
          className="px-8 py-3 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
        >
          {t("cart.continue")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-40 pt-6 sm:pt-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors overflow-hidden rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">{t("cart.title")}</h1>
          </div>
          <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg">
            {items.length} {items.length === 1 ? t("cart.item_count") : t("cart.items_count")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center gap-4 group"
                >
                  <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 rounded-2xl overflow-hidden shrink-0 border border-zinc-100 dark:border-zinc-700">
                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-zinc-900 dark:text-white truncate">
                      {(item.name as any)[language] || item.name}
                    </h3>
                    <p className="text-orange-600 dark:text-orange-500 font-bold text-sm mt-1">
                      {item.price.toLocaleString()} RWF
                    </p>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 shrink-0">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-zinc-500 hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-black w-8 text-center text-zinc-900 dark:text-white">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-zinc-500 hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                        title={t("cart.remove")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-black text-zinc-900 dark:text-white">
                      {(item.price * item.quantity).toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{t("cart.total_price_suffix")}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-xl sticky top-32">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 uppercase tracking-tight text-center">{t("cart.total")}</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span className="text-sm font-medium">{t("cart.subtotal")}</span>
                  <span className="font-bold">{totalPrice.toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span className="text-sm font-medium">{t("cart.delivery")}</span>
                  <span className="text-xs font-bold uppercase text-green-500">{t("cart.free")}</span>
                </div>
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex justify-between items-center text-zinc-900 dark:text-white">
                  <span className="font-bold">{t("cart.estimated_total")}</span>
                  <span className="text-2xl font-black">{totalPrice.toLocaleString()} <span className="text-xs font-bold text-zinc-400">RWF</span></span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-5 bg-[#F26C24] hover:bg-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-600/20 transition-all uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                {t("cart.checkout")}
              </button>
              
              <p className="text-[10px] text-center text-zinc-400 mt-4 px-4 font-medium leading-relaxed">
                {t("cart.taxes_notice")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
