import React, { useState, useRef, useEffect } from 'react';
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

const PersonaChat: React.FC = () => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const selectedPersona = PERSONAS.find(p => p.id === selectedPersonaId);

  useEffect(() => {
    if (selectedPersona) {
      setChat(createChat(selectedPersona.systemInstruction));
      setMessages([{ role: 'model', text: selectedPersona.welcomeMessage }]);
    } else {
      setChat(null);
      setMessages([]);
    }
  }, [selectedPersona]);

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
          newMessages[newMessages.length - 1].text = 'Sorry, I encountered an error. Please try again later.';
          return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedPersona) {
    return (
      <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 md:p-6 shadow-2xl shadow-black/20">
        <div className="flex-shrink-0 mb-4 text-center">
            <h2 className="text-xl font-bold text-white">Persona Chat</h2>
            <p className="text-sm text-zinc-400">Pilih karakter AI untuk memulai percakapan.</p>
        </div>
        <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PERSONAS.map(persona => (
                    <button 
                        key={persona.id} 
                        onClick={() => setSelectedPersonaId(persona.id)}
                        className="p-4 bg-zinc-800/50 border border-zinc-700/80 rounded-lg text-left hover:bg-zinc-700/50 hover:border-violet-500/50 transition-all transform hover:scale-[1.03]"
                    >
                        <persona.Icon className="w-8 h-8 text-violet-400 mb-3" />
                        <h3 className="font-semibold text-white">{persona.name}</h3>
                        <p className="text-xs text-zinc-400 mt-1">{persona.description}</p>
                    </button>
                ))}
            </div>
        </div>
      </div>
    );
  }

  return (
     <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
      <div className="p-4 border-b border-zinc-800 backdrop-blur-sm flex items-center gap-4">
        <button onClick={() => setSelectedPersonaId(null)} className="text-zinc-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
        </button>
        <div>
            <h2 className="text-xl font-bold text-white">{selectedPersona.name}</h2>
            <p className="text-sm text-zinc-400">Anda sedang chat dengan {selectedPersona.name}</p>
        </div>
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
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            placeholder={`Ketik pesan untuk ${selectedPersona.name}...`}
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

export default PersonaChat;
