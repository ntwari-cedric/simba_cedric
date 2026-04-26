import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { categories } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { useProducts } from '../context/ProductContext';

export default function Category() {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const { language, t } = useLanguage();
  const { products } = useProducts();
  const [manualMaxPrice, setManualMaxPrice] = useState<number | ''>('');
  
  const category = categories.find(c => c.id === id);
  const categoryProducts = products
    .filter(p => p.categoryId === id)
    .filter(p => manualMaxPrice === '' || p.price <= (manualMaxPrice as number));

  useEffect(() => {
    // Simulate loading for the skeleton
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600); // 600ms fake loading
    return () => clearTimeout(timer);
  }, [id]);

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{t("category.not_found")}</h2>
        <Link to="/" className="text-orange-600 dark:text-orange-500 font-medium hover:underline">
          {t("category.return_home")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 pb-32">
      <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700/50 sticky top-16 md:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white inline-flex items-center gap-3">
              {category.name[language]}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0 scrollbar-none justify-start md:justify-end">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t("search.max_price") || "Max Price:"}</span>
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-700 rounded-xl p-0.5">
                 <div className="flex items-center px-1 sm:px-2">
                   <input 
                     type="number" 
                     placeholder={t("search.custom") || "Custom"}
                     value={manualMaxPrice}
                     onChange={(e) => setManualMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                     className="w-14 sm:w-20 bg-transparent border-none py-1.5 px-0.5 sm:px-1 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-100 focus:ring-0 outline-none"
                   />
                   <span className="text-[9px] sm:text-[10px] text-zinc-400 mr-1 sm:mr-2 uppercase">RWF</span>
                 </div>
                 <div className="border-l border-zinc-200 dark:border-zinc-600 h-4 sm:h-5"></div>
                 <select 
                   onChange={(e) => {
                     if (e.target.value !== '') setManualMaxPrice(Number(e.target.value));
                     e.target.value = '';
                   }}
                   defaultValue=""
                   className="bg-transparent border-none text-xs sm:text-sm font-bold text-zinc-600 dark:text-zinc-300 focus:ring-0 outline-none cursor-pointer py-1.5 px-1 sm:px-2"
                 >
                   <option value="" disabled>{t("search.presets") || "Presets ▼"}</option>
                   <option value="500">500 RWF</option>
                   <option value="1000">1,000 RWF</option>
                   <option value="5000">5,000 RWF</option>
                   <option value="10000">10,000 RWF</option>
                 </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <div key={n} className="bg-white dark:bg-zinc-800 rounded-2xl p-4 flex flex-col border border-zinc-100 dark:border-zinc-700/50 shadow-sm animate-pulse">
                <div className="aspect-square w-full mb-3 rounded-xl bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3 mb-2" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-1" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4"
          >
            {categoryProducts.length > 0 ? (
              categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-zinc-500 dark:text-zinc-400">
                {t("category.no_products")}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
