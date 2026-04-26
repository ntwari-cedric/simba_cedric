import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Category } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps & { key?: React.Key }) {
  const { language } = useLanguage();

  return (
    <Link to={`/category/${category.id}`}>
      <motion.div 
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="flex flex-col bg-[#F6F6F6] dark:bg-zinc-800 rounded-2xl cursor-pointer overflow-hidden group transition-all aspect-square border border-transparent dark:border-zinc-700/50"
      >
        <div className="flex-1 w-full overflow-hidden">
           <img 
            src={category.image} 
            alt={category.name[language]}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
           />
        </div>
        
        <div className="px-2 pb-2 sm:pb-3 pt-1.5 sm:pt-2 w-full flex items-center justify-center shrink-0">
          <h3 className="text-[11px] sm:text-xs font-extrabold text-zinc-900 dark:text-white text-center leading-tight line-clamp-2">
            {category.name[language]}
          </h3>
        </div>
      </motion.div>
    </Link>
  );
}
