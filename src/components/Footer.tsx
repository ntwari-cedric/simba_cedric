import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, Store, X, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { branches } from '../data/mockData';

export default function Footer() {
  const { t } = useLanguage();
  const [isLocationsOpen, setIsLocationsOpen] = useState(false);

  const reviews = [
    { name: "Richard Madete", text: t("home.footer.review_1") },
    { name: "Stella Matutina", text: t("home.footer.review_2") },
    { name: "Dipankar Lahkar", text: t("home.footer.review_3") },
    { name: "MUHOZA Rene", text: t("home.footer.review_4") }
  ];

  const { language } = useLanguage();

  return (
    <footer className="bg-zinc-900 text-zinc-400 pt-16 pb-8 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* About Section */}
          <div className="space-y-6">
            <h3 className="text-white font-black text-xl tracking-tight uppercase">{t("home.footer.about")}</h3>
            <p className="text-sm leading-relaxed font-medium">
              {t("home.footer.about_text")}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="p-2 bg-zinc-800 rounded-lg hover:text-white hover:bg-orange-600 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-zinc-800 rounded-lg hover:text-white hover:bg-orange-600 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-zinc-800 rounded-lg hover:text-white hover:bg-orange-600 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-white font-black text-xl tracking-tight uppercase">{t("home.footer.locations")}</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setIsLocationsOpen(true)}
                className="group flex items-center gap-3 w-full p-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl border border-zinc-700 transition-all text-white font-bold"
              >
                <div className="p-2 bg-orange-600 rounded-xl group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <span>{t("home.footer.view_branches") || "View All Branches"}</span>
                <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="pt-2">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">{t("home.footer.top_locations") || "Top Locations"}</p>
                <ul className="space-y-2">
                  <li className="text-sm hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
                    {(branches.find(b => b.id === '1')?.name as any)?.[language] || 'Simba City Center (UTC)'}
                  </li>
                  <li className="text-sm hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
                    {(branches.find(b => b.id === '4')?.name as any)?.[language] || 'Simba Kimironko'}
                  </li>
                  <li className="text-sm hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
                    {(branches.find(b => b.id === '9')?.name as any)?.[language] || 'Simba Gisenyi'}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-white font-black text-xl tracking-tight uppercase">{t("home.footer.contact")}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-white font-bold">{t("home.footer.call_center") || "Call Center"}</p>
                  <p className="text-zinc-500">+250 123 456 789</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-white font-bold">{t("home.footer.email_support") || "Email Support"}</p>
                  <p className="text-zinc-500">info@simba.rw</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter / App Info */}
          <div className="space-y-6">
            <h3 className="text-white font-black text-xl tracking-tight uppercase">Simba Rwanda</h3>
            <div className="bg-zinc-800 p-6 rounded-3xl border border-zinc-700">
              <p className="text-xs font-medium leading-relaxed mb-4">
                {t("home.footer.follow_us") || "Follow us for daily updates on fresh products and special discounts across all branches."}
              </p>
              <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest">
                {t("home.footer.trusted_since") || "Trusted since 1990"}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-800 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-600">
            © {new Date().getFullYear()} Simba Supermarket. {t("home.footer.rights")}.
          </p>
        </div>
      </div>

      {/* Locations Modal */}
      <AnimatePresence>
        {isLocationsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLocationsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[85vh] bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-600/20 text-orange-600 dark:text-orange-500 rounded-2xl">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{t("home.footer.our_locations") || "Our Locations"}</h2>
                    <p className="text-sm text-zinc-500 font-medium">{t("home.footer.find_near_you") || "Find a Simba near you in Rwanda"}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsLocationsOpen(false)}
                  className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {branches.map(branch => (
                    <div 
                      key={branch.id}
                      className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 hover:border-orange-500/30 transition-all group"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-sm text-zinc-400 group-hover:text-orange-600 transition-colors">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-zinc-900 dark:text-white truncate uppercase tracking-tight">{(branch.name as any)[language] || branch.name}</h4>
                          <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{(branch.city as any)[language] || branch.city}</p>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                        {(branch.address as any)[language] || branch.address}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-6 pt-4">
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                    <div className="w-8 h-1 bg-orange-600 rounded-full"></div>
                    {t("home.footer.what_customers_say") || "What Customers Say"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map((review, i) => (
                      <div key={i} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] shadow-sm italic text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-serif relative">
                        <span className="text-4xl text-zinc-100 dark:text-zinc-800 absolute -top-2 left-4 font-black">"</span>
                        <p className="relative z-10">{review.text}</p>
                        <p className="mt-4 font-sans font-black text-zinc-900 dark:text-white not-italic text-xs uppercase tracking-widest">— {review.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 shrink-0">
                <button 
                  onClick={() => setIsLocationsOpen(false)}
                  className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-2xl text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {t("home.footer.close_locations") || "Close Locations"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
