'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, X, Users, User, CheckCheck, 
  Search, Phone, ShieldCheck, Sparkles, Smile, Paperclip
} from 'lucide-react';
import { 
  RealtimeChatMessage, 
  getStoredChatMessages, 
  sendStoredChatMessage,
  syncChatMessagesFromServer,
  mergeChatMessages 
} from '@/lib/mock-data';

interface AdminChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminChatModal({ isOpen, onClose }: AdminChatModalProps) {
  const [messages, setMessages] = useState<RealtimeChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [activeAgent, setActiveAgent] = useState<'sardor' | 'jasur' | 'alisher'>('sardor');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const agentsList = [
    { id: 'sardor', name: 'Sardor Rahimov', role: 'Yetakchi Sotuv Agenti', phone: '+998 90 123 45 67', online: true },
    { id: 'jasur', name: 'Jasur Qodirov', role: 'Sotuv Agenti (Toshkent)', phone: '+998 90 234 56 78', online: true },
    { id: 'alisher', name: 'Alisher Vohidov', role: 'Sotuv Agenti (Viloyat)', phone: '+998 90 345 67 89', online: false },
  ];

  const currentAgent = agentsList.find(a => a.id === activeAgent) || agentsList[0];

  useEffect(() => {
    setMessages(getStoredChatMessages());

    // Dastlabki serverdan yuklash
    syncChatMessagesFromServer().then((srvMsgs) => {
      if (srvMsgs && srvMsgs.length > 0) {
        setMessages((prev) => mergeChatMessages(prev, srvMsgs));
      }
    });

    const handleChatUpdated = (e: CustomEvent<{ messages: RealtimeChatMessage[] }>) => {
      if (e.detail && Array.isArray(e.detail.messages)) {
        setMessages((prev) => mergeChatMessages(prev, e.detail.messages));
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'holva_crm_chat_messages') {
        setMessages((prev) => mergeChatMessages(prev, getStoredChatMessages()));
      }
    };

    window.addEventListener('holva-chat-updated' as any, handleChatUpdated);
    window.addEventListener('storage', handleStorage);

    // Cross-device server polling (har 1.5 soniyada serverdan yangi xabarlarni tekshirish)
    const interval = setInterval(() => {
      syncChatMessagesFromServer().then((srvMsgs) => {
        if (srvMsgs && srvMsgs.length > 0) {
          setMessages((prev) => mergeChatMessages(prev, srvMsgs));
        }
      });
    }, 1500);

    return () => {
      window.removeEventListener('holva-chat-updated' as any, handleChatUpdated);
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const activeMessages = messages.filter(m => (m.agentId || 'sardor') === activeAgent);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, activeAgent, activeMessages.length]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const updated = sendStoredChatMessage(activeAgent, 'admin', 'Super Admin', input.trim());
    setMessages(updated);
    setInput('');

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      {/* Orqa fon */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer" 
        onClick={onClose} 
      />

      {/* Asosiy Chat Oynasi */}
      <div className="relative bg-white dark:bg-gray-900 rounded-t-[32px] sm:rounded-3xl w-full max-w-2xl h-[82vh] sm:h-[80vh] max-h-[640px] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col z-10 slide-up my-0 sm:my-auto">
        
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-3.5 sm:p-4 bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-2xl flex items-center justify-center font-bold backdrop-blur-xs">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                Agentlar Bilan Aloqa
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">Real-time</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-amber-100">Har bir agent bilan alohida shaxsiy chat</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-white/15 rounded-xl transition text-white/90 hover:text-white cursor-pointer"
            title="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobil uchun Agentlar Switcher Gorizontal Paneli */}
        <div className="sm:hidden flex items-center gap-1.5 p-2 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-800 overflow-x-auto mobile-scroll flex-shrink-0">
          {agentsList.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(agent.id as any)}
              className={`
                px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer touch-press
                ${activeAgent === agent.id 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }
              `}
            >
              <span className={`w-2 h-2 rounded-full ${agent.online ? 'bg-emerald-400' : 'bg-gray-400'}`} />
              {agent.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Content Body: Sidebar + Chat Box */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          
          {/* Agentlar Ro'yxati (Desktop & Tablet) */}
          <div className="w-60 lg:w-64 border-r border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/40 p-3 space-y-2 hidden sm:block overflow-y-auto">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2">Sotuv Agentlari</p>
            
            {agentsList.map((agent) => {
              const lastAgentMsg = messages.filter(m => (m.agentId || 'sardor') === agent.id).slice(-1)[0];
              return (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgent(agent.id as any)}
                  className={`
                    w-full text-left p-2.5 rounded-2xl transition flex items-center gap-3 cursor-pointer
                    ${activeAgent === agent.id 
                      ? 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-gray-800 flex items-center justify-center font-bold text-amber-700 dark:text-amber-400 text-xs">
                      {agent.name.charAt(0)}
                    </div>
                    {agent.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{agent.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {lastAgentMsg ? lastAgentMsg.text : agent.role}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Chat Maydoni */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900">
            
            {/* Faol Agent Info Header */}
            <div className="flex-shrink-0 p-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                  {currentAgent.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{currentAgent.name}</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                    <span className={`w-1.5 h-1.5 rounded-full ${currentAgent.online ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                    {currentAgent.online ? 'Online · Jonli aloqa' : 'Offline'} · {currentAgent.role}
                  </p>
                </div>
              </div>

              <a 
                href={`tel:${currentAgent.phone}`}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 hover:text-amber-600 transition cursor-pointer"
                title={`${currentAgent.name}ga qo'ng'iroq qilish`}
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            {/* Xabarlar Lentasi (Tanlangan Agent Uchun Alohida) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/40 dark:bg-gray-950/30 mobile-scroll min-h-0">
              {activeMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
                  <MessageCircle className="w-10 h-10 text-gray-300 dark:text-gray-700 mb-2" />
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400">{currentAgent.name} bilan yozishmani boshlang</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Yuborilgan xabar darhol agent mobil ilovasida ko&apos;rinadi</p>
                </div>
              ) : (
                activeMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-xs sm:text-sm shadow-xs ${
                        msg.sender === 'admin'
                          ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-tr-none'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none border border-gray-100 dark:border-gray-700'
                      }`}
                    >
                      <p className={`text-[10px] font-bold mb-0.5 ${msg.sender === 'admin' ? 'text-amber-100' : 'text-amber-600 dark:text-amber-400'}`}>
                        {msg.senderName}
                      </p>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className={`text-[10px] ${msg.sender === 'admin' ? 'text-amber-100/90' : 'text-gray-400'}`}>
                          {msg.time}
                        </span>
                        {msg.sender === 'admin' && (
                          <CheckCheck className="w-3 h-3 text-amber-200" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Pastki Kiritish Paneli */}
            <form onSubmit={handleSend} className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-2 pb-6 sm:pb-4">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`${currentAgent.name.split(' ')[0]}ga xabar yozing...`}
                className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-2xl hover:from-amber-700 hover:to-amber-600 transition disabled:opacity-40 cursor-pointer shadow-md shadow-amber-500/20 touch-press active:scale-95 flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminChatModal;
