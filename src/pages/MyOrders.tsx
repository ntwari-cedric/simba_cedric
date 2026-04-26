import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { Package, ChevronRight, Calendar, ShoppingBag, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface OrderItem {
  id: string;
  name: any;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  createdAt: any;
  deliveryLocation: string;
}

export default function MyOrders() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching my orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <Package className="w-16 h-16 text-zinc-200 mb-4" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{t("auth.please_login")}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
          {t("nav.my_orders")}
          <span className="text-sm font-black bg-[#F26C24] px-3 py-1 rounded-full text-white shadow-lg shadow-orange-500/20">
            {orders.length}
          </span>
        </h1>
        <p className="text-zinc-500 mt-2 font-medium">Track your recent orders and history.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-white dark:bg-zinc-900 rounded-3xl animate-pulse border border-zinc-100 dark:border-zinc-800" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-16 text-center border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{t("order.no_history")}</h2>
          <p className="text-zinc-500 font-medium">Start shopping to see your orders here!</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {orders.map((order) => (
              <OrderListItem key={order.id} order={order} language={language} t={t} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function OrderListItem({ order, language, t }: { key?: React.Key, order: Order, language: string, t: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center shrink-0">
              <Package className="w-6 h-6 text-[#F26C24]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">#{order.id.slice(-6).toUpperCase()}</span>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                  order.status === 'on_the_way' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                }`}>
                  {order.status === 'pending' ? t("order.pending") : 
                   order.status === 'processing' ? t("order.processing") :
                   order.status === 'on_the_way' ? t("order.on_way") :
                   order.status === 'delivered' ? t("order.completed") : 
                   order.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-zinc-500">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(date, 'MMM dd, yyyy')}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(date, 'HH:mm')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-6">
            <div className="text-left sm:text-right">
              <p className="text-[10px] font-black uppercase text-zinc-400 mb-0.5">{t("nav.order_total")}</p>
              <p className="text-lg font-black text-zinc-900 dark:text-white">{order.totalPrice.toLocaleString()} <span className="text-[10px]">RWF</span></p>
            </div>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-[#F26C24] text-white' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-100'}`}
            >
              <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800"
            >
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-[#F26C24] tracking-widest">{t("admin.order_items")}</h4>
                <div className="grid grid-cols-1 gap-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                          {typeof item.name === 'string' ? item.name : item.name[language]}
                        </p>
                        <p className="text-[10px] font-medium text-zinc-500">{item.price.toLocaleString()} RWF x {item.quantity}</p>
                      </div>
                      <p className="text-sm font-black text-zinc-900 dark:text-white">
                        {(item.price * item.quantity).toLocaleString()} RWF
                      </p>
                    </div>
                  ))}
                </div>
                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] font-black uppercase text-[#F26C24] tracking-widest mb-2">Delivery Address</p>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{order.deliveryLocation}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
