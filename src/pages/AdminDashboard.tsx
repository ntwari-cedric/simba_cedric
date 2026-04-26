import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, ShoppingBag, TrendingUp, Package, ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useProducts } from '../context/ProductContext';
import { categories } from '../data/mockData';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, subDays, startOfDay } from 'date-fns';
import { toast } from 'sonner';

const data = [
  { name: 'Mon', revenue: 4000, orders: 24 },
  { name: 'Tue', revenue: 3000, orders: 13 },
  { name: 'Wed', revenue: 9000, orders: 48 },
  { name: 'Thu', revenue: 7800, orders: 39 },
  { name: 'Fri', revenue: 11000, orders: 68 },
  { name: 'Sat', revenue: 13900, orders: 85 },
  { name: 'Sun', revenue: 8000, orders: 43 },
];

export default function AdminDashboard() {
  const { t, language } = useLanguage();
  const { products } = useProducts();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all orders real-time to compute metrics
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let activeOrders = 0;
    const uniqueCustomers = new Set<string>();

    orders.forEach(order => {
      if (order.status === 'delivered') {
        totalRevenue += order.totalPrice;
      }
      if (['pending', 'processing', 'on_the_way'].includes(order.status)) {
        activeOrders++;
      }
      if (order.userEmail) {
        uniqueCustomers.add(order.userEmail);
      }
    });

    return {
      totalRevenue,
      activeOrders,
      totalCustomers: uniqueCustomers.size,
      totalProducts: products.length
    };
  }, [orders, products]);

  // Compute 7 days chart data
  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => startOfDay(subDays(new Date(), 6 - i)));
    
    return days.map(day => {
      const dayName = format(day, 'EEE');
      
      const dayOrders = orders.filter(o => {
        if (!o.createdAt) return false;
        const oDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date();
        return startOfDay(oDate).getTime() === day.getTime();
      });

      const revenue = dayOrders.reduce((sum, o) => sum + (o.status === 'delivered' ? o.totalPrice : 0), 0);
      return {
        name: dayName,
        revenue,
        orders: dayOrders.length
      };
    });
  }, [orders]);

  const generatePDFReport = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text("Simba Supermarket Admin Report", 14, 20);
      
      doc.setFontSize(14);
      doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 14, 30);
      
      doc.setFontSize(12);
      doc.text("Overview Metrics:", 14, 45);
      
      autoTable(doc, {
        startY: 50,
        head: [['Metric', 'Value']],
        body: [
          ['Total Revenue (Delivered Orders)', `${metrics.totalRevenue.toLocaleString()} RWF`],
          ['Active Orders', metrics.activeOrders.toString()],
          ['Total Customers (Unique Emails)', metrics.totalCustomers.toString()],
          ['Total Products', metrics.totalProducts.toString()],
        ],
      });

      const finalY = (doc as any).lastAutoTable.finalY || 50;
      doc.text("Recent Orders (Last 20):", 14, finalY + 15);

      const recentOrders = orders.slice(0, 20).map(o => [
        o.id.slice(-6).toUpperCase(),
        o.userEmail,
        `${o.totalPrice.toLocaleString()} RWF`,
        o.status,
        format(o.createdAt?.toDate ? o.createdAt.toDate() : new Date(), 'MMM dd, yyyy HH:mm')
      ]);

      autoTable(doc, {
        startY: finalY + 20,
        head: [['Order ID', 'Customer', 'Total', 'Status', 'Date']],
        body: recentOrders,
      });

      doc.save(`simba_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success("Report generated and downloaded!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report");
    }
  };

  const cards = [
    { title: t("admin.total_revenue"), value: metrics.totalRevenue.toLocaleString(), prefix: 'RWF ', icon: DollarSign, trend: 'Current', positive: true },
    { title: t("admin.active_orders"), value: metrics.activeOrders.toLocaleString(), icon: ShoppingBag, trend: 'Live', positive: true },
    { title: t("admin.total_customers"), value: metrics.totalCustomers.toLocaleString(), icon: Users, trend: 'Total', positive: true },
    { title: t("admin.total_products"), value: metrics.totalProducts.toLocaleString(), icon: Package, trend: 'Active', positive: true },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">{t("admin.overview_title")}</h1>
        <p className="text-zinc-500 font-medium mt-1">{t("admin.manage_store")}</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-50 dark:bg-zinc-800 rounded-2xl">
                <card.icon className="w-6 h-6 text-orange-600 dark:text-orange-500" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                card.positive ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
              }`}>
                {card.positive ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {card.trend}
              </span>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">{card.title}</p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                {card.prefix}<span className={card.prefix ? "text-xl font-bold ml-0.5" : ""}>{card.value}</span>
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" /> Revenue Overview
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Last 7 days performance</p>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f26c24" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f26c24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#71717a', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#71717a', fontWeight: 600 }}
                  tickFormatter={(val) => `RWF ${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#f4f4f5', strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#f26c24" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Quick Actions / Recent Activity Placeholder */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.5 }}
           className="bg-zinc-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-6 tracking-tight">{t("admin.quick_connect")}</h3>
            <div className="space-y-4">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <p className="text-sm font-bold text-orange-200 uppercase tracking-widest mb-1 text-[10px]">{t("admin.new_user_reg")}</p>
                <p className="font-bold">ntwaricedrick... {t("admin.just_joined")}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <p className="text-sm font-bold text-orange-200 uppercase tracking-widest mb-1 text-[10px]">{t("admin.restock_alert")}</p>
                <p className="font-bold">Ikivuguto Milk {t("admin.running_low")}</p>
              </div>
            </div>
            <button 
              onClick={generatePDFReport}
              className="mt-8 w-full py-4 bg-orange-600 hover:bg-orange-500 rounded-xl font-black text-sm uppercase tracking-widest transition-colors shadow-lg shadow-orange-600/30"
            >
              {t("admin.generate_report")}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Top Products Table */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden"
      >
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">{t("admin.top_products")}</h3>
          <button className="text-sm font-bold text-orange-600 hover:text-orange-700 transition">{t("admin.view_all_products")}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-800/50">
                <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">{t("admin.product_name")}</th>
                <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">{t("admin.category")}</th>
                <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">{t("admin.price")}</th>
                <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">{t("admin.sales")}</th>
                <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">{t("admin.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {products.slice(0, 5).map((product, i) => {
                const pName = typeof product.name === 'string' ? product.name : product.name[language] || product.name.EN;
                const catName = categories.find(c => c.id === product.categoryId)?.name;
                const cName = catName ? (typeof catName === 'string' ? catName : catName[language] || catName.EN) : product.categoryId;
                
                return (
                 <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="px-8 py-5 text-sm font-bold text-zinc-900 dark:text-white line-clamp-1 truncate max-w-[200px]">{pName}</td>
                  <td className="px-8 py-5 text-sm font-medium text-zinc-500">{cName}</td>
                  <td className="px-8 py-5 text-sm font-black text-zinc-900 dark:text-white">{product.price.toLocaleString()} <span className="text-[10px] text-zinc-400">RWF</span></td>
                  <td className="px-8 py-5 text-sm font-bold text-zinc-500">{product.stock}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      product.stock > 10 
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
                    }`}>
                      {product.stock > 10 ? t("admin.in_stock") : t("admin.low_stock")}
                    </span>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
