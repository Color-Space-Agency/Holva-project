'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Bot, Sparkles, TrendingUp, Users, ShoppingBag, 
  DollarSign, Zap, Lightbulb, ArrowUp, ArrowDown,
  X, Send, Loader2, Brain, BarChart3, Package,
  Store, Calendar, Clock, AlertCircle, CheckCircle,
  Maximize2, Minimize2, ChevronDown
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getStoredProducts, getStoredOrders, getStoredStores } from '@/lib/mock-data';

interface AIMessage {
  role: 'user' | 'assistant';
  text: string;
  suggestions?: string[];
  timestamp?: Date;
}

export function AIAssistant({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Analitika ma'lumotlari
  const analyticsData = {
    totalRevenue: 22400000,
    revenueGrowth: 18,
    totalOrders: getStoredOrders().length,
    orderGrowth: 12,
    totalProducts: getStoredProducts().length,
    topProducts: [
      { name: 'Kunjutli Premium Holva', sales: 142, revenue: 28400000, growth: 12 },
      { name: 'Shokoladli Yong\'oqli Holva', sales: 98, revenue: 19600000, growth: 8 },
      { name: 'Pista Mag\'izli Samarqand', sales: 76, revenue: 15200000, growth: 15 },
    ],
    lowProducts: [
      { name: 'Yong\'oqli Aralash Holva', sales: 12, revenue: 2400000, growth: -5 },
      { name: 'Sutli Kichik Holva', sales: 8, revenue: 1600000, growth: -10 },
    ],
    topAgents: [
      { name: 'Sardor Rahimov', revenue: 22400000, orders: 6, growth: 18 },
      { name: 'Jasur Qodirov', revenue: 18200000, orders: 5, growth: 12 },
      { name: 'Alisher Vohidov', revenue: 15600000, orders: 4, growth: 8 },
    ],
    stores: {
      total: getStoredStores().length,
      active: 38,
      new: 5,
      inactive: 7
    },
  };

  // AI Aqlli Javob Generatori
  const generateAIResponse = (userInput: string): { text: string; suggestions?: string[] } => {
    const query = userInput.toLowerCase();
    
    // Salomlashuv
    if (query.includes('salom') || query.includes('assalom') || query.includes('hi') || query.includes('hello') || query.includes('privet')) {
      return {
        text: "Assalomu alaykum! Men Holva Factory AI yordamchisiman. Zavod va savdo ko'rsatkichlari bo'yicha quyidagilarni taqdim etaman:",
        suggestions: [
          "📊 Bugungi savdo 22.4 mln so'm — rejadan 118% ortiq",
          "📈 O'sish sur'ati 18% — o'tgan oyga nisbatan",
          "🏆 Eng yaxshi agent: Sardor — 22.4 mln so'm",
          "💡 Top mahsulotlar va ombor qoldig'i bo'yicha tavsiyalar"
        ]
      };
    }

    // Savdo analitikasi
    if (query.includes('savdo') || query.includes('analitika') || query.includes('tushum') || query.includes('sales') || query.includes('daromad')) {
      return {
        text: "📊 Savdo analitikasi va tushumlar holati:",
        suggestions: [
          `💰 Jami oylik tushum: ${formatCurrency(analyticsData.totalRevenue)}`,
          `📈 O'sish sur'ati: +${analyticsData.revenueGrowth}% (o'tgan davrga nisbatan)`,
          `📦 Sotuvlar soni: ${analyticsData.totalOrders} ta (+${analyticsData.orderGrowth}%)`,
          `🏪 Faol savdo nuqtalari: ${analyticsData.stores.active} ta (${analyticsData.stores.new} ta yangi do'kon)`
        ]
      };
    }

    // Top mahsulotlar
    if (query.includes('top') || query.includes('mahsulot') || query.includes('tovar') || query.includes('eng ko\'p') || query.includes('xaridorgir')) {
      const topList = analyticsData.topProducts.map((p, i) => 
        `${i+1}. ${p.name} — ${p.sales} dona (${formatCurrency(p.revenue)}, +${p.growth}%)`
      );
      return {
        text: "🏆 Eng ko'p sotilayotgan xaridorgir mahsulotlar:",
        suggestions: topList
      };
    }

    // Kam sotilayotgan / Muammoli mahsulotlar
    if (query.includes('kam') || query.includes('muammo') || query.includes('tushib') || query.includes('sekin') || query.includes('qoldiq')) {
      const lowList = analyticsData.lowProducts.map((p) => 
        `${p.name} — ${p.sales} dona (${formatCurrency(p.revenue)}, ${p.growth}%)`
      );
      return {
        text: "⚠️ Diqqat talab qiluvchi sekin sotilayotgan mahsulotlar:",
        suggestions: lowList
      };
    }

    // Agentlar reytingi
    if (query.includes('agent') || query.includes('xodim') || query.includes('reyting') || query.includes('sotuvchi')) {
      const agentsList = analyticsData.topAgents.map((a, i) => 
        `${i+1}. ${a.name} — ${formatCurrency(a.revenue)} (${a.orders} ta Sotuv, +${a.growth}%)`
      );
      return {
        text: "👨💼 Sotuv agentlari bo'yicha yetakchilar reytingi:",
        suggestions: agentsList
      };
    }

    // Tavsiyalar
    if (query.includes('tavsiya') || query.includes('maslahat') || query.includes('reja') || query.includes('fikr') || query.includes('strategiya')) {
      return {
        text: "💡 AI Biznes Tavsiyalari:",
        suggestions: [
          "1. Shokoladli Yong'oqli Holva ishlab chiqarish hajmini oshiring — talab 15% ga o'smoqda",
          "2. Korzinka va Makro tarmoqlari uchun kassa oldi mini-qadoqlarni ko'paytiring",
          "3. Yangi 5 ta ochilgan do'konga aksiyali birinchi partiyani taklif qiling",
          "4. Kundalik agentlar savdo rejasini 120% ga ko'tarish imkoniyati mavjud"
        ]
      };
    }

    // Umumiy statistika
    if (query.includes('statistika') || query.includes('umumiy') || query.includes('zavod') || query.includes('ombor')) {
      return {
        text: "📋 Zavod bo'yicha umumiy statistika:",
        suggestions: [
          `🏢 Do'konlar: ${analyticsData.stores.total} ta (faol: ${analyticsData.stores.active})`,
          `📦 Mahsulot turlari: ${analyticsData.totalProducts} xil holvalar`,
          `📈 O'rtacha Sotuv cheki: 3.7 mln so'm`,
          `⏰ Agentlar tashrif rejasi: 75% bajarildi`
        ]
      };
    }

    // Standart javob
    return {
      text: "Men sizga quyidagi yo'nalishlarda tezkor yordam bera olaman:",
      suggestions: [
        "📊 Savdo analitikasi va o'sish",
        "🏆 Top eng xaridorgir mahsulotlar",
        "👨💼 Agentlar savdo reytingi",
        "💡 AI biznes tavsiyalari",
        "⚠️ Diqqat talab mahsulotlar",
        "📋 Umumiy zavod statistikasi"
      ]
    };
  };

  const handleSend = (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    const userMessage: AIMessage = { role: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    if (!customText) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = generateAIResponse(textToSend);
      const aiMessage: AIMessage = { 
        role: 'assistant', 
        text: aiResponse.text,
        suggestions: aiResponse.suggestions,
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 600 + Math.random() * 400);
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className={`
      fixed z-50 transition-all duration-300
      ${isMinimized 
        ? 'bottom-4 right-4 w-72 h-14' 
        : isExpanded 
          ? 'bottom-2 right-2 sm:bottom-4 sm:right-4 w-[calc(100vw-16px)] sm:w-[540px] h-[90vh] max-h-[750px]' 
          : 'bottom-2 right-2 sm:bottom-4 sm:right-4 w-[calc(100vw-16px)] sm:w-[420px] h-[82vh] max-h-[620px]'
      }
    `}>
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-3.5 sm:p-4 bg-gradient-to-r from-amber-600 via-amber-600 to-orange-600 text-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xs">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-amber-700 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-1.5 leading-tight">
                AI Assistant
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">v2.0</span>
              </h3>
              <p className="text-[11px] text-amber-100/90">Savdo analitikasi & maslahatchi</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-white/15 rounded-xl transition text-white/90 hover:text-white cursor-pointer hidden sm:flex"
              title={isExpanded ? "Kichraytirish" : "Kattalashtirish"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-white/15 rounded-xl transition text-white/90 hover:text-white cursor-pointer"
              title={isMinimized ? "Ochish" : "Yashirish"}
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-white/15 rounded-xl transition text-white/90 hover:text-white cursor-pointer"
              title="Yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Agar minimallashtirilgan bo'lsa */}
        {isMinimized ? (
          <div 
            onClick={() => setIsMinimized(false)}
            className="flex-1 flex items-center px-4 text-xs font-bold text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-500 mr-2 animate-pulse" />
            AI Yordamchini ochish uchun bosing...
          </div>
        ) : (
          <>
            {/* Xabarlar Lentasi */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/60 dark:bg-gray-950/40 mobile-scroll min-h-0">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950 rounded-3xl flex items-center justify-center mb-3 shadow-xs">
                    <Bot className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-base">Holva Factory AI Assistant</h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
                    Savdo ko&apos;rsatkichlari, agentlar natijalari yoki mahsulotlar bo&apos;yicha savol bering
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4 justify-center max-w-sm">
                    {["Savdo analitikasi", "Top mahsulotlar", "Agentlar reytingi", "Tavsiyalar"].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSend(suggestion)}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-bold text-gray-700 dark:text-gray-200 hover:border-amber-400 hover:text-amber-600 transition shadow-xs cursor-pointer touch-press"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className={`
                    max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm
                    ${msg.role === 'user' 
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-tr-none shadow-sm shadow-amber-500/20' 
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-xs'
                    }
                  `}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-700/60 space-y-1.5">
                        {msg.suggestions.map((sug, i) => (
                          <div key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1.5 leading-snug">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{sug}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <span className={`text-[10px] block text-right mt-1.5 ${msg.role === 'user' ? 'text-amber-100' : 'text-gray-400'}`}>
                      {msg.timestamp?.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Pastki Kiritish Maydoni */}
            <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Savolingizni yozing..."
                  className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="p-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-2xl hover:from-amber-700 hover:to-amber-600 transition disabled:opacity-40 cursor-pointer shadow-md shadow-amber-500/20 touch-press active:scale-95 flex items-center justify-center flex-shrink-0"
                >
                  {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>

              {/* Tezkor Savollar Chips */}
              <div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-1 mobile-scroll">
                <button 
                  onClick={() => handleSend('Savdo analitikasi')}
                  className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 rounded-xl text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:text-amber-600 transition whitespace-nowrap cursor-pointer touch-press"
                >
                  📊 Analitika
                </button>
                <button 
                  onClick={() => handleSend('Top mahsulotlar')}
                  className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 rounded-xl text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:text-amber-600 transition whitespace-nowrap cursor-pointer touch-press"
                >
                  🏆 Top tovarlar
                </button>
                <button 
                  onClick={() => handleSend('Tavsiyalar')}
                  className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 rounded-xl text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:text-amber-600 transition whitespace-nowrap cursor-pointer touch-press"
                >
                  💡 Tavsiyalar
                </button>
                <button 
                  onClick={() => handleSend('Agentlar reytingi')}
                  className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 rounded-xl text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:text-amber-600 transition whitespace-nowrap cursor-pointer touch-press"
                >
                  👨💼 Agentlar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AIAssistant;
