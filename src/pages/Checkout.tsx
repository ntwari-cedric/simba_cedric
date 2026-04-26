import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CreditCard, ChevronRight, CheckCircle2, ArrowLeft, MapPin, Store, Truck, Navigation } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { branches, Branch } from '../data/mockData';
import { toast } from 'sonner';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type PaymentMethod = 'momo' | 'airtel' | 'card';

// Haversine distance helper
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const p = 0.017453292519943295;
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a));
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, loading, openLoginModal, isAdmin } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('momo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  // Form state
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Location state
  const [selectedBranch, setSelectedBranch] = useState('');
  const [userLocation, setUserLocation] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const detectLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        
        // Find nearest branch
        let nearest: Branch | null = null;
        let minDistance = Infinity;

        branches.forEach(branch => {
          const dist = getDistance(latitude, longitude, branch.lat, branch.lng);
          if (dist < minDistance) {
            minDistance = dist;
            nearest = branch;
          }
        });

        if (nearest) {
          setSelectedBranch((nearest as Branch).id);
          const branchName = typeof (nearest as Branch).name === 'string' 
            ? (nearest as Branch).name 
            : ((nearest as Branch).name as any)[language];
          toast.success(`Nearest branch detected: ${branchName} (${minDistance.toFixed(1)}km away)`);
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Could not detect your location. Please select manually.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (!loading && !isSuccess) {
      if (!user) {
        navigate('/login', { state: { from: { pathname: '/checkout' } } });
      } else if (isAdmin) {
        navigate('/admin');
      }
    }
  }, [user, loading, isAdmin, navigate, isSuccess]);

  const isValid = () => {
    // Branch and Location are now mandatory
    if (!selectedBranch || !userLocation) return false;

    if (selectedMethod === 'card') {
      return cardNumber.length >= 16 && expiry.length >= 5 && cvv.length >= 3;
    }
    return phone.length >= 8;
  };

  const handlePay = async () => {
    if (!isValid() || !user) return;
    setIsProcessing(true);
    
    try {
      // Save order to Firestore
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalPrice,
        selectedBranchId: selectedBranch,
        deliveryLocation: userLocation,
        paymentMethod: selectedMethod,
        phone: selectedMethod !== 'card' ? phone : null,
        status: 'processing',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'orders'), orderData);

      // Simulate a small delay for experience
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
        toast.success(t("checkout.success_message"), {
          duration: 5000,
          icon: <Truck className="w-5 h-5 text-green-600" />
        });
        clearCart();
      }, 1000);
    } catch (error) {
      console.error("Order placement failed:", error);
      setIsProcessing(false);
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
          <ChevronRight className="w-10 h-10 text-zinc-400 rotate-90" />
        </div>
        <h2 className="text-2xl font-bold mb-4 dark:text-white">{t("cart.empty")}</h2>
        <Link to="/" className="text-orange-600 font-bold hover:underline">{t("category.return_home")}</Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-white dark:bg-zinc-950">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-24 h-24 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-500 mb-8 relative"
        >
          <CheckCircle2 className="w-14 h-14" />
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -right-2 -bottom-2 bg-white dark:bg-zinc-900 p-2 rounded-lg shadow-lg border border-zinc-100 dark:border-zinc-800"
          >
            <Truck className="w-6 h-6 text-orange-600" />
          </motion.div>
        </motion.div>
        <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-4">{t("checkout.success_title")}</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-10 max-w-sm mx-auto font-bold text-lg leading-relaxed">
          {t("checkout.success_message")}
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-10 py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95"
        >
          {t("checkout.return_home")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-32 pt-6 sm:pt-10">
      <div className="max-w-4xl mx-auto px-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">{t("auth.back")}</span>
        </button>

        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-8 tracking-tight">{t("checkout.title")}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Branch & Location */}
            <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-100 dark:border-zinc-800 space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-600/20 text-orange-600 dark:text-orange-500 rounded-xl">
                    <Store className="w-5 h-5" />
                  </div>
                  {t("checkout.select_branch")}
                </h2>
                
                <div className="relative group">
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full pl-6 pr-10 py-4 appearance-none rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="" disabled>{t("checkout.choose_branch")}...</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {(branch.name as any)[language] || branch.name} - {(branch.city as any)[language] || branch.city} ({(branch.address as any)[language] || branch.address})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-500 rounded-xl">
                      <MapPin className="w-5 h-5" />
                    </div>
                    {t("checkout.your_location")}
                  </h2>
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={isLocating}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-500 font-bold text-xs rounded-xl hover:bg-blue-100 dark:hover:bg-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-pulse' : ''}`} />
                    {isLocating ? t("checkout.locating") : t("checkout.detect_location")}
                  </button>
                </div>
                
                <textarea
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                  placeholder={t("checkout.location_placeholder")}
                  rows={2}
                  className="w-full px-6 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold placeholder:text-zinc-400 focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
                />
              </div>
            </section>

            {/* Payment Methods */}
            <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-100 dark:border-zinc-800">
              <h2 className="text-xl font-bold mb-8 text-zinc-900 dark:text-white">{t("checkout.payment_method")}</h2>
              
              <div className="grid grid-cols-1 gap-4">
                <PaymentOption 
                  id="momo"
                  active={selectedMethod === 'momo'}
                  onClick={() => setSelectedMethod('momo')}
                  icon={<div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center font-black text-black text-[10px] shadow-sm">MTN</div>}
                  title={t("checkout.momo")}
                  subtitle="Pay with MTN Mobile Money"
                />

                <PaymentOption 
                  id="airtel"
                  active={selectedMethod === 'airtel'}
                  onClick={() => setSelectedMethod('airtel')}
                  icon={<div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center font-black text-white text-[10px] shadow-sm">Airtel</div>}
                  title={t("checkout.airtel")}
                  subtitle="Pay with Airtel Money"
                />

                <PaymentOption 
                  id="card"
                  active={selectedMethod === 'card'}
                  onClick={() => setSelectedMethod('card')}
                  icon={<div className="w-12 h-12 bg-zinc-800 dark:bg-zinc-700 rounded-xl flex items-center justify-center text-white shadow-sm"><CreditCard className="w-6 h-6" /></div>}
                  title={t("checkout.card")}
                  subtitle="Visa, Mastercard, etc."
                />
              </div>
            </section>

            {/* Input Details */}
            <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-100 dark:border-zinc-800">
              <div className="space-y-6">
                {(selectedMethod === 'momo' || selectedMethod === 'airtel') ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">{t("checkout.phone_number")}</label>
                      <div className="relative group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold border-r border-zinc-200 dark:border-zinc-700 pr-3">+250</span>
                        <input 
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="78X XXX XXX"
                          className="w-full pl-20 pr-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold placeholder:text-zinc-400 ring-offset-white dark:ring-offset-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-500/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-500/20">
                      <p className="text-xs text-orange-800 dark:text-orange-300 font-medium leading-relaxed">
                        {selectedMethod === 'momo' 
                          ? t("checkout.momo_prompt")
                          : t("checkout.airtel_prompt")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">{t("checkout.card_number")}</label>
                      <input 
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                        maxLength={16}
                        placeholder="0000 0000 0000 0000"
                        className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold placeholder:text-zinc-400 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">{t("checkout.expiry_date")}</label>
                        <input 
                          type="text"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">{t("checkout.cvv")}</label>
                        <input 
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                          maxLength={3}
                          placeholder="123"
                          className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                      <p className="text-[10px] text-blue-800 dark:text-blue-300 font-medium text-center italic">
                        {t("checkout.card_secure")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-md border border-zinc-100 dark:border-zinc-800 lg:sticky lg:top-32 h-fit">
              <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">{t("checkout.summary")}</h2>
              <div className="max-h-72 overflow-y-auto mb-8 space-y-6 pr-2 scrollbar-none">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-100 dark:border-zinc-700">
                      <img src={item.image} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{(item.name as any)[language] || item.name}</p>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">{item.quantity} x {item.price.toLocaleString()} RWF</p>
                    </div>
                    <div className="flex flex-col justify-center items-end">
                      <p className="text-sm font-black text-orange-600 dark:text-orange-500">{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t-2 border-dashed border-zinc-100 dark:border-zinc-800 pt-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-widest leading-none">{t("checkout.total_to_pay")}</span>
                  <span className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{totalPrice.toLocaleString()} <span className="text-xs font-bold text-zinc-400 ml-1">RWF</span></span>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={isProcessing || !isValid()}
                className="w-full py-5 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-black rounded-2xl shadow-xl shadow-orange-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:active:scale-100"
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="tracking-wide uppercase text-sm">{t("checkout.pay_now")}</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({ id, active, onClick, icon, title, subtitle }: { 
  id: string, 
  active: boolean, 
  onClick: () => void, 
  icon: React.ReactNode, 
  title: string, 
  subtitle: string 
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all relative overflow-hidden group ${
        active 
          ? "border-orange-500 bg-orange-50/50 dark:bg-orange-500/10" 
          : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
      }`}
    >
      <div className="flex items-center gap-5 relative z-10">
        {icon}
        <div className="text-left">
          <p className={`font-black tracking-tight ${active ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-900 dark:text-white'}`}>{title}</p>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
        active ? 'border-orange-500 bg-orange-500 text-white' : 'border-zinc-200 dark:border-zinc-700'
      }`}>
        {active && <CheckCircle2 className="w-4 h-4" />}
      </div>
    </button>
  );
}
