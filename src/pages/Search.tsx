import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Search as SearchIcon, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { categories } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { useProducts, MergedProduct } from '../context/ProductContext';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [isLoading, setIsLoading] = useState(false);
  
  const { language, t } = useLanguage();
  const { products } = useProducts();
  
  const [searchInput, setSearchInput] = useState(query);

  // Sync search input with URL query
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // Sort and Filter state
  const [sortBy, setSortBy] = useState('relevance');
  const [filterCategory, setFilterCategory] = useState('all');
  const [manualMaxPrice, setManualMaxPrice] = useState<number | ''>('');

  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSearchSubmit = () => {
    setSearchParams({ q: searchInput.trim() });
  };

  // Filter and Sort products
  const searchResults = products
    .filter(p => {
      if (!query) return false;
      
      let matchesQuery = false;
      let matchesCategory = filterCategory === 'all' || p.categoryId === filterCategory;
      let matchesPrice = true;

      // Standard text filtering
      const lowerQuery = query.toLowerCase();
      matchesQuery = typeof p.name === 'string' 
        ? p.name.toLowerCase().includes(lowerQuery)
        : (
            p.name.EN?.toLowerCase().includes(lowerQuery) ||
            p.name.FR?.toLowerCase().includes(lowerQuery) ||
            p.name.KIN?.toLowerCase().includes(lowerQuery)
          );

      if (manualMaxPrice !== '' && p.price > (manualMaxPrice as number)) {
        matchesPrice = false;
      }

      return matchesQuery && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      // Sort logic
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0; // Default relevance (original order)
    });

  // Client side fake loading for regular search
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, sortBy, filterCategory]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 pb-32">
      <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700/50 sticky top-16 md:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex-1 relative max-w-2xl group flex items-center bg-zinc-100 dark:bg-zinc-700 rounded-full focus-within:ring-2 focus-within:ring-orange-500 overflow-hidden">
                <div className="pl-4 pr-2">
                   <SearchIcon className="w-5 h-5 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input 
                  ref={inputRef}
                  type="text" 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit();
                    }
                  }}
                  placeholder={t("nav.search_placeholder") || "Search products (e.g. milk under 5000)"}
                  className="w-full bg-transparent border-none py-3 pr-4 outline-none text-zinc-900 dark:text-white placeholder-zinc-500"
                />
                {searchInput && (
                  <button 
                    onClick={() => {
                      setSearchInput('');
                      inputRef.current?.focus();
                    }}
                    className="p-2 mr-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={handleSearchSubmit}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-5 py-3 font-bold transition-colors flex items-center justify-center shrink-0"
                >
                  <SearchIcon className="w-5 h-5 sm:hidden" />
                  <span className="hidden sm:inline">{t("nav.search") || "Search"}</span>
                </button>
              </div>
            </div>

            {/* Filter and Sort UI */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0 scrollbar-none justify-start md:justify-end md:ml-auto">
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

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t("search.sort_by")}:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm font-bold bg-zinc-100 dark:bg-zinc-700 border-none rounded-xl px-4 py-2 text-zinc-800 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price_asc">{t("search.sort.price_asc")}</option>
                    <option value="price_desc">{t("search.sort.price_desc")}</option>
                    <option value="rating">{t("search.sort.rating")}</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t("search.filter_by")}:</span>
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="text-sm font-bold bg-zinc-100 dark:bg-zinc-700 border-none rounded-xl px-4 py-2 text-zinc-800 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="all">{t("search.filter.all_categories")}</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name[language]}
                      </option>
                    ))}
                  </select>
                </div>
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
              </div>
            ))}
          </div>
        ) : searchResults.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4"
          >
            {searchResults.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
               <SearchIcon className="w-10 h-10 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{t("search.no_results")}</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">{t("search.try_again")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
