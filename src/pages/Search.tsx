import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search as SearchIcon, X, Sparkles, Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { categories } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { useProducts, MergedProduct } from '../context/ProductContext';
import { parseSearchWithAI, AISearchResult } from '../lib/groqSearch';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { language, t } = useLanguage();
  const { products } = useProducts();

  const [searchInput, setSearchInput] = useState(query);
  const [isLoading, setIsLoading] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiResult, setAiResult] = useState<AISearchResult | null>(null);

  // Sort and Filter state
  const [sortBy, setSortBy] = useState('relevance');
  const [filterCategory, setFilterCategory] = useState('all');
  const [manualMaxPrice, setManualMaxPrice] = useState<number | ''>('');

  const inputRef = useRef<HTMLInputElement>(null);
  const aiSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync search input with URL query
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // Run AI search whenever query changes
  useEffect(() => {
    if (!query) {
      setAiResult(null);
      return;
    }

    setIsAILoading(true);
    setIsLoading(true);

    if (aiSearchTimeout.current) clearTimeout(aiSearchTimeout.current);
    aiSearchTimeout.current = setTimeout(async () => {
      const result = await parseSearchWithAI(query);
      setAiResult(result);

      // Only auto-apply price filter from AI — never auto-change category dropdown
      if (result.isAIQuery && result.maxPrice) {
        setManualMaxPrice(result.maxPrice);
      }

      setIsAILoading(false);
      setIsLoading(false);
    }, 300);

    return () => {
      if (aiSearchTimeout.current) clearTimeout(aiSearchTimeout.current);
    };
  }, [query]);

  // Fake-loading on sort/filter changes
  useEffect(() => {
    if (!query) return;
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, [sortBy, filterCategory, manualMaxPrice]);

  const handleSearchSubmit = () => {
    const trimmed = searchInput.trim();
    if (!trimmed) return;
    setSearchParams({ q: trimmed });
  };

  // Filter and sort products — keywords are ALWAYS required
  const searchResults = products
    .filter((p) => {
      if (!query || !aiResult) return false;

      // Price filter: prefer manual override, then AI-extracted price
      const effectiveMaxPrice =
        manualMaxPrice !== '' ? (manualMaxPrice as number) : aiResult.maxPrice;
      const matchesPrice = effectiveMaxPrice ? p.price <= effectiveMaxPrice : true;

      // Category filter: only apply if user manually changed it from 'all'
      const matchesCategory =
        filterCategory === 'all' || p.categoryId === filterCategory;

      // Build the product name string for matching
      const productName =
        typeof p.name === 'string'
          ? p.name.toLowerCase()
          : [p.name.EN, p.name.FR, p.name.KIN]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();

      // Keywords always required — AI or plain text, no exceptions
      const keywords = aiResult.isAIQuery ? aiResult.keywords : [query.toLowerCase()];
      const matchesKeyword = keywords.some((kw) => productName.includes(kw.toLowerCase()));

      return matchesKeyword && matchesPrice && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const aiSuggestions = [
    'milk less than 5000',
    'alcoholic drinks under 10000',
    'good products for children',
    'cheap cleaning products',
    'baby diapers under 3000',
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 pb-32">
      {/* Search Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700/50 sticky top-16 md:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex-1 relative max-w-2xl group flex items-center bg-zinc-100 dark:bg-zinc-700 rounded-full focus-within:ring-2 focus-within:ring-orange-500 overflow-hidden">
                <div className="pl-4 pr-2 flex items-center gap-1">
                  {isAILoading ? (
                    <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                  ) : aiResult?.isAIQuery && query ? (
                    <Sparkles className="w-5 h-5 text-orange-500" />
                  ) : (
                    <SearchIcon className="w-5 h-5 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
                  )}
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearchSubmit();
                  }}
                  placeholder="Try: milk less than 5000, drinks for adults, baby products..."
                  className="w-full bg-transparent border-none py-3 pr-4 outline-none text-zinc-900 dark:text-white placeholder-zinc-400 text-sm"
                />
                {searchInput && (
                  <button
                    onClick={() => {
                      setSearchInput('');
                      setAiResult(null);
                      setManualMaxPrice('');
                      setFilterCategory('all');
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
                  <span className="hidden sm:inline">{t('nav.search') || 'Search'}</span>
                </button>
              </div>
            </div>

            {/* AI Result Banner */}
            <AnimatePresence>
              {aiResult?.isAIQuery && aiResult.explanation && query && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 rounded-xl text-sm"
                >
                  <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="text-orange-700 dark:text-orange-300 font-medium">
                    AI: {aiResult.explanation}
                  </span>
                  {aiResult.maxPrice && (
                    <span className="ml-auto text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-semibold shrink-0">
                      Max {aiResult.maxPrice.toLocaleString()} RWF
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0 scrollbar-none justify-start md:justify-end md:ml-auto">
                {/* Max Price */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    {t('search.max_price') || 'Max Price:'}
                  </span>
                  <div className="flex items-center bg-zinc-100 dark:bg-zinc-700 rounded-xl p-0.5">
                    <div className="flex items-center px-1 sm:px-2">
                      <input
                        type="number"
                        placeholder={t('search.custom') || 'Custom'}
                        value={manualMaxPrice}
                        onChange={(e) =>
                          setManualMaxPrice(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        className="w-14 sm:w-20 bg-transparent border-none py-1.5 px-0.5 sm:px-1 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-100 focus:ring-0 outline-none"
                      />
                      <span className="text-[9px] sm:text-[10px] text-zinc-400 mr-1 sm:mr-2 uppercase">
                        RWF
                      </span>
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
                      <option value="" disabled>
                        {t('search.presets') || 'Presets ▼'}
                      </option>
                      <option value="500">500 RWF</option>
                      <option value="1000">1,000 RWF</option>
                      <option value="3000">3,000 RWF</option>
                      <option value="5000">5,000 RWF</option>
                      <option value="10000">10,000 RWF</option>
                      <option value="50000">50,000 RWF</option>
                    </select>
                  </div>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    {t('search.sort_by')}:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm font-bold bg-zinc-100 dark:bg-zinc-700 border-none rounded-xl px-4 py-2 text-zinc-800 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price_asc">{t('search.sort.price_asc')}</option>
                    <option value="price_desc">{t('search.sort.price_desc')}</option>
                    <option value="rating">{t('search.sort.rating')}</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    {t('search.filter_by')}:
                  </span>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="text-sm font-bold bg-zinc-100 dark:bg-zinc-700 border-none rounded-xl px-4 py-2 text-zinc-800 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="all">{t('search.filter.all_categories')}</option>
                    {categories.map((cat) => (
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

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Suggestions (shown when no query) */}
        {!query && (
          <div className="flex flex-col items-center py-12 gap-6">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <span className="font-semibold">Try asking in natural language:</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-xl">
              {aiSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSearchInput(s);
                    setSearchParams({ q: s });
                  }}
                  className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full text-sm text-zinc-700 dark:text-zinc-300 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {(isLoading || isAILoading) && query && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-zinc-800 rounded-2xl p-4 flex flex-col border border-zinc-100 dark:border-zinc-700/50 shadow-sm animate-pulse"
              >
                <div className="aspect-square w-full mb-3 rounded-xl bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3 mb-2" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-1" />
              </div>
            ))}
          </div>
        )}

        {/* Results grid */}
        {!isLoading && !isAILoading && query && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              <span className="font-bold text-zinc-800 dark:text-zinc-100">{searchResults.length}</span> products found
              {aiResult?.isAIQuery && (
                <span className="ml-2 inline-flex items-center gap-1 text-orange-500">
                  <Sparkles className="w-3.5 h-3.5" /> AI-powered
                </span>
              )}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4">
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </motion.div>
        )}

        {/* No results */}
        {!isLoading && !isAILoading && query && searchResults.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <SearchIcon className="w-10 h-10 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
              {t('search.no_results')}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
              {t('search.try_again')}
            </p>
            {(manualMaxPrice !== '' || aiResult?.maxPrice) && (
              <button
                onClick={() => {
                  setManualMaxPrice('');
                  setFilterCategory('all');
                }}
                className="px-5 py-2 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-colors"
              >
                Remove price filter & try again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
