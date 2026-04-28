import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles, Loader2, ShoppingCart, Bot, ChevronDown, Trash2 } from 'lucide-react';
import { useProducts, MergedProduct } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { ChatMessage, sendMessage } from '../lib/simbaAI';
import { useLanguage } from '../context/LanguageContext';

// ── Mini product card shown inside chat ──────────────────────────────────────
function ChatProductCard({ product }: { product: MergedProduct }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const name = typeof product.name === 'string' ? product.name : product.name.EN || '';
  const inStock = product.inStock !== false && product.stock > 0;

  const handleAdd = () => {
    if (!inStock) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl p-2 min-w-[160px] max-w-[180px] shrink-0 shadow-sm">
      <img
        src={product.image}
        alt={name}
        className="w-12 h-12 rounded-lg object-cover shrink-0 bg-zinc-100"
        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=?'; }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 truncate leading-tight">{name}</p>
        <p className="text-xs font-bold text-orange-500 mt-0.5">{product.price.toLocaleString()} RWF</p>
        <button
          onClick={handleAdd}
          disabled={!inStock}
          className={`mt-1 w-full text-[10px] font-bold py-1 rounded-lg transition-all ${
            !inStock
              ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed'
              : added
              ? 'bg-green-500 text-white'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {!inStock ? 'Out of stock' : added ? '✓ Added' : '+ Cart'}
        </button>
      </div>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center shrink-0 mt-1">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`flex flex-col gap-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Text bubble */}
        <div
          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-orange-500 text-white rounded-tr-sm'
              : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-zinc-100 dark:border-zinc-700 rounded-tl-sm shadow-sm'
          }`}
        >
          {msg.content}
        </div>

        {/* Product cards row */}
        {msg.products && msg.products.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
            {msg.products.map((p) => (
              <ChatProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-2 items-start">
      <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center">
          <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

// ── Quick suggestion chips ────────────────────────────────────────────────────
const SUGGESTIONS = [
  'Show me milk under 5000 RWF',
  'Cheapest beer available',
  'Good products for babies',
  'Cleaning products under 3000',
  'Where are your branches?',
  'Recommend something for cooking',
];

// ── Main Chat Component ───────────────────────────────────────────────────────
export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const { products } = useProducts();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setHasNewMessage(false);
    }
  }, [isOpen]);

  // Greeting on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content:
            `👋 Hi! I'm **Simba AI**, your personal shopping assistant.\n\nI have full access to our entire product catalog (${products.length} products across all categories). Ask me anything:\n\n• "Show me milk under 5,000 RWF"\n• "What's the cheapest beer?"\n• "Good products for my baby"\n• "Where are your branches?"\n\nHow can I help you today?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, products.length]);

  const handleSend = async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || isLoading) return;

    setInput('');

    const userMsg: ChatMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { text: responseText, products: responseProducts } = await sendMessage(
        messageText,
        messages,
        products
      );

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: responseText,
        products: responseProducts,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (!isOpen) setHasNewMessage(true);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting right now. Please check your internet connection and try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setTimeout(() => {
      if (isOpen) {
        setMessages([
          {
            role: 'assistant',
            content: `👋 Chat cleared! I'm still here to help. What are you looking for?`,
            timestamp: new Date(),
          },
        ]);
      }
    }, 100);
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {hasNewMessage && !isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 shadow-lg max-w-[200px]"
            >
              New message from Simba AI 💬
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen((v) => !v)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-xl flex items-center justify-center transition-colors relative"
          aria-label="Open AI Chat"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <ChevronDown className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <Sparkles className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unread dot */}
          {hasNewMessage && !isOpen && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
          )}
        </motion.button>
      </div>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] sm:w-[400px] max-h-[600px] flex flex-col bg-zinc-50 dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-orange-500 shrink-0">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm leading-tight">Simba AI Assistant</p>
                <p className="text-orange-100 text-xs">{products.length} products · {messages.length > 0 ? 'Online' : 'Ready to help'}</p>
              </div>
              <button
                onClick={clearChat}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions (shown when only greeting is visible) */}
            {messages.length <= 1 && !isLoading && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="shrink-0 text-xs px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full text-zinc-600 dark:text-zinc-300 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors whitespace-nowrap"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 py-3 border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shrink-0">
              <div className="flex items-end gap-2 bg-zinc-100 dark:bg-zinc-700 rounded-xl px-3 py-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about our products..."
                  rows={1}
                  className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-zinc-900 dark:text-white placeholder-zinc-400 max-h-24 leading-relaxed"
                  style={{ scrollbarWidth: 'none' }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-600 text-white flex items-center justify-center transition-colors shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-center text-[10px] text-zinc-400 mt-1.5">
                Powered by Groq · Press Enter to send
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
