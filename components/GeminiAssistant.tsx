import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles, Loader } from 'lucide-react';
import { ChatMessage, ChatRole } from '../types';
import { sendMessageToGemini, initializeChat } from '../services/geminiService';

export const GeminiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: ChatRole.MODEL, text: "A paz esteja com você. Eu sou a Lumen, sua guia espiritual. Como posso ajudar você a explorar a Bíblia ou nosso conteúdo hoje?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: ChatRole.USER, text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await sendMessageToGemini(userMsg);
      setMessages(prev => [...prev, { role: ChatRole.MODEL, text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: ChatRole.MODEL, text: "Peço perdão, estou com dificuldades para processar seu pedido agora." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 bg-amber-600 hover:bg-amber-500 text-white p-4 rounded-full shadow-2xl transition-transform duration-300 hover:scale-110 flex items-center justify-center group ${isOpen ? 'hidden' : 'flex'}`}
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
        <span className="absolute right-full mr-3 bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
            Fale com a Lumen
        </span>
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[90vw] md:w-[400px] h-[600px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 flex justify-between items-center border-b border-slate-700">
            <div className="flex items-center space-x-2">
              <div className="bg-amber-500/20 p-2 rounded-lg">
                 <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">Guia Lumen</h3>
                <p className="text-xs text-slate-400">Powered by Gemini</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === ChatRole.USER ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === ChatRole.USER 
                    ? 'bg-amber-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-gray-200 rounded-tl-none border border-slate-700'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 flex items-center space-x-2">
                    <Loader className="w-4 h-4 text-amber-400 animate-spin" />
                    <span className="text-xs text-slate-400">Consultando sabedoria...</span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte sobre uma história..."
                className="flex-1 bg-slate-950 text-white border border-slate-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-amber-600 text-white p-2 rounded-full hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};