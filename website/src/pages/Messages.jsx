import { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Send, Trash2, MoreVertical, ShieldCheck, CheckCheck, Search } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!user) return;
    api.get('/messages')
      .then(res => {
        const msgs = res.data?.data || [];
        setMessages(msgs);
        
        const params = new URLSearchParams(location.search);
        const chatId = params.get('chatId');
        if (chatId) {
          const chatToOpen = msgs.find(m => m.id === chatId);
          if (chatToOpen) openChat(chatToOpen);
        }
      })
      .catch(console.error);
  }, [location.search]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSender: true
    };
    
    setChatHistory([...chatHistory, newMessage]);
    setInputText('');
  };

  const openChat = (msg) => {
    setActiveChat(msg);
    setChatHistory([
      { id: 1, text: "Hi, I'll be arriving in about 15 minutes for the service.", time: "10:30 AM", isSender: false },
      { id: 2, text: "Great, see you soon!", time: "10:32 AM", isSender: true },
      { id: 3, text: msg.lastmessage || msg.lastMessage, time: msg.timestamp || msg.lastMessageTime, isSender: false }
    ]);
  };

  const handleDeleteChat = (e, id) => {
    e.stopPropagation();
    api.delete(`/messages/${id}`)
      .then(() => {
        setMessages(prev => prev.filter(m => m.id !== id));
        if (activeChat?.id === id) setActiveChat(null);
      })
      .catch(console.error);
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] bg-white dark:bg-slate-900 transition-colors overflow-hidden">
      
      {/* Sidebar: Chat List */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[380px] border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-20`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
           <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white mb-6">Messages</h1>
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none text-sm font-bold transition-all"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.filter(m => (m.sendername || m.providerName || '').toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center opacity-40">
              <MessageCircle className="w-16 h-16 mb-4" />
              <span className="font-bold text-sm">No conversations found</span>
            </div>
          ) : (
            messages.filter(m => (m.sendername || m.providerName || '').toLowerCase().includes(searchTerm.toLowerCase())).map(msg => {
              const isActive = activeChat?.id === msg.id;
              const senderName = msg.sendername || msg.senderName || msg.providerName || 'Unknown User';
              const senderAvatar = msg.senderavatar || msg.senderAvatar || msg.providerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=random`;
              const lastMessage = msg.lastmessage || msg.lastMessage || 'No recent messages';
              const unreadCount = msg.unreadcount || msg.unreadCount || 0;
              const timestamp = msg.timestamp || msg.lastMessageTime;

              return (
                <div 
                  key={msg.id} 
                  onClick={() => openChat(msg)}
                  className={`flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all duration-300 group ${
                    isActive 
                      ? 'bg-blue-600 shadow-xl shadow-blue-600/20' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img 
                      src={senderAvatar} 
                      alt={senderName} 
                      className={`w-14 h-14 rounded-2xl object-cover shadow-sm ${isActive ? 'border-2 border-white/50' : ''}`} 
                    />
                    {msg.isonline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-black truncate text-sm tracking-tight ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{senderName}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>{timestamp}</span>
                    </div>
                    <p className={`text-xs line-clamp-1 font-bold ${isActive ? 'text-blue-50' : 'text-slate-500 dark:text-slate-400'}`}>{lastMessage}</p>
                  </div>
                  
                  {unreadCount > 0 && !isActive && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30">
                      <span className="text-[10px] text-white font-black">{unreadCount}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${activeChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-slate-50 dark:bg-slate-900 transition-colors relative`}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="px-8 h-24 flex items-center justify-between bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveChat(null)} className="md:hidden p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <ArrowLeft className="w-6 h-6 text-slate-900 dark:text-white" />
                </button>
                <div className="relative">
                  <img src={activeChat.senderavatar || activeChat.senderAvatar || activeChat.providerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeChat.sendername || activeChat.senderName || activeChat.providerName)}&background=random`} className="w-12 h-12 rounded-2xl object-cover bg-slate-200 dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700" alt="avatar" />
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">{activeChat.sendername || activeChat.senderName || activeChat.providerName}</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Now</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-2xl transition-all">
                  <ShieldCheck className="w-5 h-5" />
                </button>
                <button className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-2xl transition-all" onClick={(e) => handleDeleteChat(e, activeChat.id)}>
                  <Trash2 className="w-5 h-5" />
                </button>
                <button className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-all">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
              <div className="flex justify-center mb-4">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">Today</span>
              </div>
              
              {chatHistory.map(chatMsg => (
                <div 
                  key={chatMsg.id} 
                  className={`flex flex-col ${chatMsg.isSender ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`p-4 md:p-5 rounded-[2rem] shadow-sm max-w-[80%] md:max-w-[70%] text-sm font-bold leading-relaxed ${
                      chatMsg.isSender 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none shadow-xl shadow-slate-900/5'
                    }`}
                  >
                    {chatMsg.text}
                  </div>
                  <div className={`flex items-center gap-2 mt-2 px-1 ${chatMsg.isSender ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      {chatMsg.time}
                    </span>
                    {chatMsg.isSender && <CheckCheck className="w-3 h-3 text-blue-600" />}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 z-20">
              <div className="max-w-4xl mx-auto flex gap-3 items-center">
                <div className="flex-1 relative group">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a professional message..."
                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl px-6 py-4 outline-none border-2 border-transparent focus:border-blue-600 transition-all font-bold shadow-inner"
                  />
                </div>
                <button 
                  onClick={handleSendMessage}
                  className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
             <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner">
                <MessageCircle className="w-12 h-12 text-blue-600 opacity-50" />
             </div>
             <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">Select a Conversation</h3>
             <p className="text-slate-500 dark:text-slate-400 font-bold max-w-sm leading-relaxed">
                Choose a provider from the list to view your chat history and book new services.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}

