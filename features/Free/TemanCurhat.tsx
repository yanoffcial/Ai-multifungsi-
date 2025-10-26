import React, { useState, useRef, useEffect } from 'react';
import { createChat } from '../../services/geminiService';
import type { Chat } from '@google/genai';
import MessageContent from '../../components/MessageContent';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const TemanCurhat: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const systemInstruction = "Kamu adalah Teman Curhat, seorang AI yang ramah, suportif, dan penuh empati. Tugasmu adalah mendengarkan keluh kesah pengguna, memberikan semangat, dan menjadi teman ngobrol yang baik. Jangan memberi nasihat medis atau finansial. Gunakan bahasa Indonesia yang santai dan akrab.";
    setChat(createChat(systemInstruction));
    setMessages([{ role: 'model', text: 'Halo! Ada yang mau diceritain? Aku di sini buat dengerin kok.' }]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chat || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const responseStream = await chat.sendMessageStream({ message: currentInput });
      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text += chunkText;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = 'Oops, sepertinya ada masalah. Coba lagi nanti ya.';
          return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
      <div className="p-4 border-b border-zinc-800 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white">Teman Curhat</h2>
        <p className="text-sm text-zinc-400">Tempat aman untuk berbagi cerita dan keluh kesah.</p>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-4 duration-500`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl shadow-md ${
              msg.role === 'user' 
                ? 'bg-violet-600 text-white rounded-br-lg' 
                : 'bg-zinc-700 text-zinc-200 rounded-bl-lg'
            }`}>
              <MessageContent text={msg.text + (isLoading && msg.role === 'model' && index === messages.length - 1 ? '...' : '')} />
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center bg-zinc-800 rounded-xl ring-1 ring-zinc-700 focus-within:ring-violet-500 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ketik ceritamu di sini..."
            className="flex-1 bg-transparent px-4 py-3 text-white placeholder-zinc-500 focus:outline-none"
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-3 text-zinc-400 hover:text-violet-400 disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors mr-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemanCurhat;