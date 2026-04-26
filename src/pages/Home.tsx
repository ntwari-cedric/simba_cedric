import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { VolumeX, Volume2, ArrowDown, Search } from 'lucide-react';
import CategoryCard from '../components/CategoryCard';
import Footer from '../components/Footer';
import { categories } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const [isMuted, setIsMuted] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const scrollToCategories = () => {
    const el = document.getElementById('categories-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Hero Section with Video */}
      <div className="relative w-full h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] overflow-hidden bg-black">
        {/* We use a public root path for the video so the user can just upload 'home-video.mp4' into the public/ folder */}
        <video
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
          {/* User should upload their video to the 'public' folder and name it 'Simba_home_video.mp4' */}
          <source src="/Simba_home_video.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg">
              {t("home.hero_title")}
            </h1>
            <p className="text-lg sm:text-2xl text-white/90 font-medium max-w-2xl mx-auto drop-shadow-md mb-8">
              {t("home.hero_subtitle")}
            </p>
            
            <button 
              onClick={scrollToCategories}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#F26C24] hover:bg-orange-600 text-white font-bold rounded-full text-lg shadow-xl shadow-orange-500/20 hover:scale-105 transition-all"
            >
              {t("home.shop_category") || "Shop Categories"}
              <ArrowDown className="w-5 h-5 animate-bounce" />
            </button>
          </motion.div>
        </div>

        {/* Sound Toggle */}
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-8 right-6 md:right-8 p-3 md:p-4 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all border border-white/10 z-10"
        >
          {isMuted ? <VolumeX className="w-5 h-5 md:w-6 md:h-6" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6" />}
        </button>

        {/* Curved Bottom Edge */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-zinc-50 dark:bg-zinc-900 rounded-t-3xl sm:-mb-2 z-10" />
      </div>

      {/* Global Search Bar */}
      <div className="w-full bg-zinc-50 dark:bg-zinc-900 py-8 px-4 sm:px-6 lg:px-8 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="relative group/search flex items-center">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-zinc-400 group-focus-within/search:text-[#F26C24] transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("nav.search_placeholder") || "Search products..."}
              className="block w-full pl-14 pr-32 py-5 border-none rounded-full leading-5 bg-white shadow-xl dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-4 focus:ring-orange-300/50 text-lg sm:text-xl transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 sm:right-3 px-6 py-3 bg-[#F26C24] hover:bg-orange-600 text-white font-bold rounded-full sm:text-lg shadow-md transition-all"
            >
              {t("nav.search") || "Search"}
            </button>
          </form>
        </div>
      </div>

      {/* Categories Section */}
      <div id="categories-section" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 relative z-10 bg-zinc-50 dark:bg-zinc-900 mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{t("home.shop_category")}</h2>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
