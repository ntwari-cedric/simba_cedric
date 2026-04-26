import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, writeBatch, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProducts } from '../context/ProductContext';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ChevronRight, Package, Clock, User, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  name: any;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  totalPrice: number;
  selectedBranchId: string;
  deliveryLocation: string;
  paymentMethod: string;
  status: string;
  createdAt: any;
}

export default function AdminOrders() {
  const { isAdmin, user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'active' | 'history'>('active');

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const historyOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));
  const displayedOrders = view === 'active' ? activeOrders : historyOrders;

  if (authLoading) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-4">
            {view === 'active' ? t("admin.nav_orders") : t("admin.order_history")}
            <span className="text-sm font-black bg-[#F26C24] px-4 py-1 rounded-full text-white shadow-lg shadow-orange-500/20">
              {displayedOrders.length}
            </span>
          </h1>
          <p className="text-zinc-500 mt-2 font-medium">
            {view === 'active' ? t("admin.orders_desc") : t("order.history_desc")}
          </p>
        </div>
        
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <button 
            onClick={() => setView('active')}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${view === 'active' ? 'bg-white dark:bg-zinc-800 text-[#F26C24] shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            {t("admin.nav_orders")}
          </button>
          <button 
            onClick={() => setView('history')}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${view === 'history' ? 'bg-white dark:bg-zinc-800 text-[#F26C24] shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            {t("admin.order_history")}
          </button>
        </div>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-white dark:bg-zinc-900 rounded-[2.5rem] animate-pulse border border-zinc-100 dark:border-zinc-800" />
          ))}
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-20 text-center border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
            {view === 'active' ? t("admin.no_orders") : t("order.no_history")}
          </h2>
          <p className="text-zinc-500 font-medium">Everything is up to date!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {displayedOrders.map((order) => (
              <OrderCard key={order.id} order={order} language={language} t={t} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, language, t }: { order: Order, language: string, t: any, key?: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const { products } = useProducts();
  
  const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();

  const handleConfirmOrder = async () => {
    if (order.status !== 'processing') return; 
    
    setIsConfirming(true);
    try {
      const batch = writeBatch(db);
      const orderRef = doc(db, 'orders', order.id);
      batch.update(orderRef, { status: 'on_the_way' });

      const notificationRef = doc(collection(db, 'notifications'));
      batch.set(notificationRef, {
        userId: order.userId,
        orderId: order.id,
        message: 'Your order is on the way, you will get it in less than 30 min',
        read: false,
        createdAt: new Date()
      });

      for (const item of order.items) {
        const currentProduct = products.find(p => p.id === item.id);
        const currentStock = currentProduct ? currentProduct.stock : 100;
        const newStock = Math.max(0, currentStock - item.quantity);
        const prodRef = doc(db, 'product_overrides', item.id);
        batch.set(prodRef, { stock: newStock }, { merge: true });
      }

      await batch.commit();
      toast.success("Order confirmed!", { icon: <CheckCircle className="w-5 h-5 text-green-500" /> });
      setIsExpanded(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to confirm order");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (order.status !== 'on_the_way') return;
    
    setIsConfirming(true);
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, { status: 'delivered' });
      
      const notificationRef = doc(collection(db, 'notifications'));
      await setDoc(notificationRef, {
        userId: order.userId,
        orderId: order.id,
        message: 'Your order has been delivered! Thank you for shopping with us.',
        read: false,
        createdAt: new Date()
      });

      toast.success("Order marked as delivered!");
      setIsExpanded(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`bg-white dark:bg-zinc-900 rounded-[2.5rem] border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${isExpanded ? 'ring-2 ring-[#F26C24]/20 border-[#F26C24]/30' : 'border-zinc-100 dark:border-zinc-800'}`}
    >
      <div className="p-6 sm:p-8">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-700">
              <Package className="w-8 h-8 text-[#F26C24]" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F26C24]">{t("admin.order_id")}</span>
                <span className="text-base font-black text-zinc-900 dark:text-white">#{order.id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm font-bold">
                  <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <User className="w-3 h-3" />
                  </div>
                  {order.userEmail}
                </div>
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm font-bold">
                  <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <Calendar className="w-3 h-3" />
                  </div>
                  {format(date, 'MMM dd, HH:mm')}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between xl:justify-end gap-x-12 gap-y-6">
            <div className="text-left xl:text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1.5">{t("admin.total")}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-[#F26C24]">{order.totalPrice.toLocaleString()}</span>
                <span className="text-xs font-black text-zinc-400">RWF</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                order.status === 'delivered' ? 'bg-green-500 text-white' :
                order.status === 'on_the_way' ? 'bg-indigo-500 text-white' :
                order.status === 'processing' ? 'bg-blue-500 text-white' :
                'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}>
                {order.status === 'pending' ? t("order.pending") : 
                 order.status === 'processing' ? t("order.processing") :
                 order.status === 'on_the_way' ? t("order.on_way") :
                 order.status === 'delivered' ? t("order.completed") : 
                 order.status}
              </span>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isExpanded ? 'bg-[#F26C24] text-white' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-900 group'}`}
              >
                <ChevronRight className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? 'rotate-90 scale-110' : 'group-hover:translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "circOut" }}
              className="overflow-hidden"
            >
              <div className="mt-10 pt-10 border-t border-zinc-100 dark:border-zinc-800">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#F26C24] mb-6 flex items-center gap-3">
                      <ShoppingBag className="w-4 h-4" /> {t("admin.order_items")}
                    </h4>
                    <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-[2rem] p-6 space-y-4 border border-zinc-100 dark:border-zinc-800">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                          <div>
                            <p className="text-sm font-black text-zinc-900 dark:text-white mb-1">
                              {typeof item.name === 'string' ? item.name : item.name[language]}
                            </p>
                            <p className="text-xs font-bold text-zinc-400">{item.price.toLocaleString()} RWF × {item.quantity}</p>
                          </div>
                          <p className="text-sm font-black text-[#F26C24]">
                            {(item.price * item.quantity).toLocaleString()} RWF
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#F26C24] mb-6 flex items-center gap-3">
                        <User className="w-4 h-4" /> {t("admin.delivery")}
                      </h4>
                      <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-[2rem] p-8 space-y-6 border border-zinc-100 dark:border-zinc-800">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Branch</p>
                            <p className="text-sm font-black text-zinc-900 dark:text-white uppercase">{order.selectedBranchId}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">{t("admin.payment")}</p>
                            <p className="text-sm font-black text-zinc-900 dark:text-white uppercase">{order.paymentMethod}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Address</p>
                          <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 leading-relaxed">{order.deliveryLocation}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-4">
                      {order.status === 'processing' && (
                        <button 
                          onClick={handleConfirmOrder}
                          disabled={isConfirming}
                          className="flex items-center gap-3 px-8 py-4 bg-[#F26C24] hover:bg-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                          {isConfirming ? (
                            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" /> Confirm & Ship
                            </>
                          )}
                        </button>
                      )}
                      {order.status === 'on_the_way' && (
                        <button 
                          onClick={handleMarkDelivered}
                          disabled={isConfirming}
                          className="flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl shadow-xl shadow-green-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                          {isConfirming ? (
                            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <Package className="w-5 h-5" /> {t("order.mark_delivered")}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
