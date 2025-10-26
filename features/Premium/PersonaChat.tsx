import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createChat } from '../../services/geminiService';
import type { Chat } from '@google/genai';
import MessageContent from '../../components/MessageContent';
import { LightBulbIcon, WorkoutIcon, BookOpenIcon, BriefcaseIcon, RecipeIcon, ChatBubbleIcon } from '../../components/icons/FeatureIcons';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const PERSONAS = [
  {
    id: 'marketing_guru',
    name: 'Marketing Guru',
    description: 'Dapatkan strategi dan ide cemerlang untuk kampanye Anda.',
    Icon: LightBulbIcon,
    systemInstruction: 'You are a world-class marketing guru with decades of experience in digital and traditional marketing. Provide insightful, strategic, and creative advice. Use marketing jargon where appropriate but always explain it clearly.',
    welcomeMessage: 'Welcome! I see a world of marketing potential before us. What campaign shall we brainstorm today?',
  },
  {
    id: 'fitness_coach',
    name: 'Pelatih Fitness',
    description: 'Rencana latihan dan tips nutrisi yang dipersonalisasi.',
    Icon: WorkoutIcon,
    systemInstruction: 'You are a certified, encouraging, and knowledgeable fitness coach. Your goal is to help users achieve their health goals safely and effectively. Provide clear instructions and motivational support. Do not give medical advice.',
    welcomeMessage: "Ready to sweat and get stronger? I'm here to guide you. What are we focusing on today?",
  },
   {
    id: 'historian',
    name: 'Sejarawan',
    description: 'Jelajahi peristiwa dan tokoh masa lalu secara mendalam.',
    Icon: BookOpenIcon,
    systemInstruction: 'You are a passionate and knowledgeable historian. You can explain any historical event, figure, or era in vivid detail. Be objective and cite your sources conceptually if asked about debates.',
    welcomeMessage: 'The past is a story waiting to be told. Which chapter of human history shall we explore today?',
  },
   {
    id: 'career_counselor',
    name: 'Konselor Karier',
    description: 'Nasihat untuk CV, wawancara, dan pengembangan karier.',
    Icon: BriefcaseIcon,
    systemInstruction: 'You are a professional and empathetic career counselor. You help users with resume building, interview preparation, and career path decisions. Provide actionable advice and be supportive.',
    welcomeMessage: "Let's build the career of your dreams, one step at a time. How can I assist you on your professional journey today?",
  },
   {
    id: 'chef',
    name: 'Koki Profesional',
    description: 'Ide resep, teknik memasak, dan tips dapur dari ahlinya.',
    Icon: RecipeIcon,
    systemInstruction: 'You are a master chef with a passion for delicious food. You can provide recipes, explain cooking techniques, and suggest ingredient pairings. Your tone is enthusiastic and a little bit gourmet.',
    welcomeMessage: 'Bonjour! The kitchen is ready, and inspiration is on the menu. What delicious creation shall we craft today?',
  },
   {
    id: 'sarcastic_friend',
    name: 'Teman Sarkas',
    description: 'Jawaban cerdas dan sedikit menyindir untuk hiburan.',
    Icon: ChatBubbleIcon,
    systemInstruction: 'You are a sarcastic but ultimately well-meaning friend. Your responses should be witty, dry, and humorous. You roll your eyes a lot, figuratively speaking. Don\'t be genuinely mean, just comedically cynical.',
    welcomeMessage: 'Oh, look who it is. I was just in the middle of a very important nap. What do you want?',
  },
];

type Persona = typeof PERSONAS[0];

const PersonaChat: React.FC = () => {
  const [view, setView] = useState<'selection' | 'chat'>('selection');
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isServiceAvailable, setIsServiceAvailable] = useState(true);
  
  const personaCardStyles = useMemo(() => {
    return PERSONAS.reduce((acc, persona) => {
        acc[persona.id] = {
            backgroundImage: `radial-gradient(300px at ${Math.floor(Math.random() * 101)}% ${Math.floor(Math.random() * 101)}%, rgba(139, 92, 246, 0.15), transparent 80%)`
        };
        return acc;
    }, {} as Record<string, React.CSSProperties>);
  }, []);

  useEffect(() => {
    if (selectedPersona) {
      setIsLoading(true); // Show loading state while initializing chat
      const newChat = createChat(selectedPersona.systemInstruction);
      if (newChat) {
        setChat(newChat);
        setMessages([{ role: 'model', text: selectedPersona.welcomeMessage }]);
        setIsServiceAvailable(true);
      } else {
        setChat(null);
        setMessages([{ role: 'model', text: `Maaf, layanan chat dengan ${selectedPersona.name} tidak tersedia saat ini karena masalah konfigurasi API Key.` }]);
        setIsServiceAvailable(false);
      }
       setIsLoading(false); // Finish initialization
    } else {
      setChat(null);
      setMessages([]);
    }
  }, [selectedPersona]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    setView('chat');
  };

  const handleBackToSelection = () => {
    setView('selection');
    setSelectedPersona(null);
  };

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
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text += chunk.text;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => {
          const newMessages = [...prev];
          const errorMessage = error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again later.';
          newMessages[newMessages.length - 1].text = errorMessage;
          return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (view === 'selection') {
    return (
        <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 md:p-6 shadow-2xl shadow-black/20 animate-fade-in">
            <div className="flex-shrink-0 mb-6 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white">Persona Chat</h2>
                <p className="text-md text-zinc-400 mt-2">Pilih seorang ahli AI untuk memulai percakapan.</p>
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PERSONAS.map(persona => (
                        <button 
                            key={persona.id} 
                            onClick={() => handleSelectPersona(persona)}
                            className="group relative flex flex-col items-start w-full h-full p-6 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-left transition-all duration-300 hover:border-violet-500/50 hover:bg-zinc-800/60 hover:-translate-y-1"
                        >
                            <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={personaCardStyles[persona.id]}></div>
                            <div className="relative mb-4 bg-zinc-800 p-3 rounded-xl border border-zinc-700">
                                <persona.Icon className="w-8 h-8 text-violet-400" />
                            </div>
                            <h3 className="font-semibold text-white text-lg">{persona.name}</h3>
                            <p className="text-sm text-zinc-400 mt-1 flex-1">{persona.description}</p>
                            <div className="mt-4 text-xs font-semibold text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Mulai Chat &rarr;
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
  }

  if (view === 'chat' && selectedPersona) {
     return (
        <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/20 animate-fade-in">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative bg-zinc-800 p-2 rounded-full border border-zinc-700">
                  <selectedPersona.Icon className="w-6 h-6 text-violet-400"/>
              </div>
              <div>
                  <h2 className="text-xl font-bold text-white">{selectedPersona.name}</h2>
                  <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                      <p className="text-xs text-zinc-400">Online</p>
                  </div>
              </div>
            </div>
            <button onClick={handleBackToSelection} className="flex items-center gap-2 px-3 py-2 text-sm bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 rounded-lg text-zinc-300 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
              </svg>
              Ganti Persona
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div key={index} className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                  {!isUser && (
                      <div className="flex-shrink-0 w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center border border-zinc-600 mt-1">
                          <selectedPersona.Icon className="w-5 h-5 text-violet-400"/>
                      </div>
                  )}
                  <div className={`max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl shadow-md ${
                  isUser 
                      ? 'bg-violet-600 text-white rounded-br-lg' 
                      : 'bg-zinc-800 text-zinc-200 rounded-bl-lg'
                  }`}>
                  <MessageContent text={msg.text + (isLoading && !isUser && index === messages.length - 1 ? '...' : '')} />
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center bg-zinc-800 rounded-xl ring-1 ring-zinc-700 focus-within:ring-violet-500 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                placeholder={isServiceAvailable ? `Ketik pesan untuk ${selectedPersona.name}...` : "Layanan tidak tersedia"}
                className="flex-1 bg-transparent px-4 py-3 text-white placeholder-zinc-500 focus:outline-none"
                disabled={isLoading || !isServiceAvailable}
              />
              <button onClick={handleSend} disabled={isLoading || !input.trim() || !isServiceAvailable} className="p-3 text-zinc-400 hover:text-violet-400 disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
     );
  }

  return null; // Fallback
};

export default PersonaChat;
