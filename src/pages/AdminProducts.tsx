import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Search, Edit2, Check, X, Filter } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useProducts, MergedProduct } from '../context/ProductContext';
import { categories } from '../data/mockData';
import { toast } from 'sonner';

export default function AdminProducts() {
  const { t, language } = useLanguage();
  const { products, updateProduct, loading } = useProducts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Real-time filtering
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const pName = typeof p.name === 'string' ? p.name : p.name[language] || p.name.EN;
      const matchesSearch = pName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory ? p.categoryId === selectedCategory : true;
      return matchesSearch && matchesCat;
    });
  }, [products, searchTerm, selectedCategory, language]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
            {t("admin.pricing")}
            <span className="text-sm font-bold bg-orange-100 dark:bg-orange-500/20 px-3 py-1 rounded-full text-orange-600 dark:text-orange-500">
              {products.length}
            </span>
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">{t("admin.manage_store")}</p>
        </div>
      </header>

      {/* Global Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm sticky top-24 z-20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input 
              type="text"
              placeholder={t("nav.search_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-none outline-none font-bold placeholder:text-zinc-400 focus:ring-2 focus:ring-orange-500 transition-all text-zinc-900 dark:text-white"
            />
          </div>
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="w-full pl-12 pr-10 py-4 appearance-none rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-none outline-none font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 cursor-pointer transition-all"
            >
              <option value="">{t("search.filter.all_categories")}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name[language] || cat.name.EN}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
         <div className="flex justify-center p-12">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProducts.map(product => (
              <AdminProductCard key={product.id} product={product} updateProduct={updateProduct} t={t} language={language} />
            ))}
          </AnimatePresence>
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <Package className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{t("search.no_results")}</h3>
              <p className="text-zinc-500 font-medium">{t("search.try_again")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AdminProductCard({ product, updateProduct, t, language }: { key?: React.Key, product: MergedProduct, updateProduct: any, t: any, language: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [priceInput, setPriceInput] = useState(product.price.toString());
  const [isSaving, setIsSaving] = useState(false);

  const pName = typeof product.name === 'string' ? product.name : product.name[language] || product.name.EN;

  const handleSave = async () => {
    const newPrice = parseFloat(priceInput);

    if (isNaN(newPrice) || newPrice < 0) {
      toast.error("Invalid price provided");
      return;
    }

    setIsSaving(true);
    try {
      await updateProduct(product.id, { price: newPrice });
      setIsEditing(false);
      toast.success("Product updated successfully", {
        icon: <Check className="w-4 h-4 text-green-500" />
      });
    } catch (e) {
      toast.error("Failed to update product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPriceInput(product.price.toString());
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden border transition-all ${
        isEditing ? 'border-orange-500 shadow-lg shadow-orange-500/10' : 'border-zinc-100 dark:border-zinc-800 shadow-sm'
      }`}
    >
      <div className="flex items-start gap-4 p-5">
        <div className="w-24 h-24 rounded-2xl bg-zinc-50 dark:bg-zinc-800 shrink-0 overflow-hidden relative border border-zinc-100 dark:border-zinc-700">
          <img src={product.image} className="w-full h-full object-cover" alt={pName} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <p className="absolute bottom-1 right-2 text-[10px] font-black text-white">{product.id.slice(0, 5)}</p>
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1 line-clamp-1">{product.categoryId}</p>
          <h3 className="font-bold text-zinc-900 dark:text-white leading-tight mb-2 line-clamp-2">{pName}</h3>
          
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
              product.stock > 0 ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
            }`}>
              {product.stock > 0 ? `${product.stock} IN STOCK` : 'OUT OF STOCK'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-widest">Price (RWF)</label>
                  <input 
                    type="number" 
                    value={priceInput}
                    onChange={e => setPriceInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button 
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors bg-white dark:bg-zinc-800 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-orange-600/20 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">{product.price.toLocaleString()} <span className="text-[10px] font-bold text-zinc-500">RWF</span></p>
                <p className="text-xs font-bold text-zinc-500 mt-1">{product.stock} units available</p>
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="w-10 h-10 bg-white dark:bg-zinc-800 flex items-center justify-center rounded-xl text-zinc-400 hover:text-orange-600 dark:text-zinc-500 dark:hover:text-orange-500 shadow-sm border border-zinc-100 dark:border-zinc-700 transition-all hover:scale-110 active:scale-95"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
