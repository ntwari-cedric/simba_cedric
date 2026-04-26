import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Plus, Minus, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '../data/mockData';
import { MergedProduct } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product | MergedProduct;
}

export default function ProductCard({ product }: ProductCardProps & { key?: React.Key }) {
  const { addItem } = useCart();
  const { isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    addItem(product, quantity);
    setIsAdded(true);
    
    // Notification
    const productName = (product.name as any)[language] || product.name;
    toast.success(`${quantity} x ${productName} added to cart`, {
      description: "You can view your items in the top bar.",
      action: {
        label: "View Cart",
        onClick: () => window.location.href = '/cart'
      },
    });

    setTimeout(() => setIsAdded(false), 2000);
    setQuantity(1); // Reset quantity after adding
  };

  const increment = () => setQuantity(prev => Math.min(prev + 1, 99));
  const decrement = () => setQuantity(prev => Math.max(prev - 1, 1));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-zinc-800 rounded-xl sm:rounded-2xl p-2 flex flex-col border border-zinc-100 dark:border-zinc-700/50 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
    >
      <div className="relative aspect-square w-full mb-1 sm:mb-2 rounded-lg sm:rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-700/50">
        <img 
          src={product.image} 
          alt={product.name[language] || (typeof product.name === 'string' ? product.name : "Product")} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
        {product.rating && (
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg flex items-center gap-0.5 shadow-sm border border-zinc-100 dark:border-zinc-800">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-[9px] sm:text-[10px] font-black text-zinc-900 dark:text-white">{product.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      
      <div className="mt-1 flex flex-col h-full justify-between">
        <div className="mb-2 sm:mb-3">
          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
            <div className="text-orange-600 dark:text-orange-500 font-bold text-sm sm:text-lg">
              {product.price.toLocaleString()} RWF
            </div>
            {'stock' in product && (
              <div className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-1 sm:px-1.5 py-0.5 rounded ${
                product.stock > 0 ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-500' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-500'
              }`}>
                {product.stock > 0 ? t("product.in_stock") || `${product.stock} IN STOCK` : t("product.out_of_stock") || 'OUT OF STOCK'}
              </div>
            )}
          </div>
          <h4 className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-tight line-clamp-2">
            {typeof product.name === 'string' ? product.name : product.name[language] || product.name.EN}
          </h4>
        </div>

        {!isAdmin && (
          <div className="space-y-1.5 sm:space-y-2 mt-auto">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-900/50 rounded-lg sm:rounded-xl p-0.5 sm:p-1">
              <button 
                onClick={decrement}
                className="p-1 sm:p-1.5 text-zinc-500 hover:text-orange-600 dark:hover:text-orange-500 transition-colors disabled:opacity-30"
                disabled={quantity <= 1 || ('stock' in product && product.stock === 0)}
              >
                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white min-w-[16px] sm:min-w-[20px] text-center">
                {quantity}
              </span>
              <button 
                onClick={increment}
                className="p-1 sm:p-1.5 text-zinc-500 hover:text-orange-600 dark:hover:text-orange-500 transition-colors disabled:opacity-30"
                disabled={'stock' in product && quantity >= product.stock}
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
            
            <button 
              onClick={handleAdd}
              disabled={'stock' in product && product.stock === 0}
              className={`w-full py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800 disabled:opacity-50 disabled:grayscale ${
                isAdded 
                  ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" 
                  : "bg-orange-600 text-white hover:bg-orange-700 shadow-md shadow-orange-600/10"
              }`}
            >
              <AnimatePresence mode="wait">
                {isAdded ? (
                  <motion.div
                    key="check"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="flex items-center gap-1 sm:gap-2"
                  >
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{t("product.added")}</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="add"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1 sm:gap-2"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{t("product.add_to_cart")}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
