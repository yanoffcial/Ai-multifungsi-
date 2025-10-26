import React, { useState } from 'react';
import { generateText } from '../../services/geminiService';

const TONES = ['Formal', 'Santai', 'Akademis', 'Kreatif', 'Persuasif'];
const LENGTHS = ['Pendek (1-2 paragraf)', 'Sedang (3-4 paragraf)', 'Panjang (5+ paragraf)'];

const EssayWriter: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState(TONES[0]);
  const [length, setLength] = useState(LENGTHS[0]);
  const [essay, setEssay] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setEssay('');

    try {
      const systemInstruction = `You are an expert essay writing assistant. Your task is to write a well-structured and coherent essay on the given topic in Indonesian. Adhere to the specified tone and length. The output should be high-quality and ready to use as a strong draft.`;
      const prompt = `Tulis sebuah esai tentang "${topic}". Gaya penulisannya harus ${tone}, dan panjangnya sekitar ${length}.`;
      const result = await generateText(prompt, systemInstruction);
      setEssay(result);
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 md:p-6 shadow-2xl shadow-black/20">
      <div className="flex-shrink-0 mb-4">
        <h2 className="text-xl font-bold text-white">Penulis Esai</h2>
        <p className="text-sm text-zinc-400">Bantuan AI untuk menyusun draf esai, artikel, atau tugas menulis.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-4">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-zinc-300 mb-2">
            Topik Esai
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
            placeholder="Contoh: Dampak AI pada pendidikan modern"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-zinc-300 mb-2">
              Gaya Penulisan
            </label>
            <select id="tone" value={tone} onChange={e => setTone(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
              {TONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="length" className="block text-sm font-medium text-zinc-300 mb-2">
              Panjang Esai
            </label>
            <select id="length" value={length} onChange={e => setLength(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
              {LENGTHS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:shadow-none"
        >
          {isLoading ? 'Menulis...' : "Tulis Esai"}
        </button>
      </form>
      
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 min-h-[200px] text-zinc-300 whitespace-pre-wrap leading-relaxed">
          {isLoading && <p className="text-zinc-500 animate-pulse">Menyusun esai Anda...</p>}
          {error && <p className="text-red-400">{error}</p>}
          {essay}
        </div>
      </div>
    </div>
  );
};

export default EssayWriter;