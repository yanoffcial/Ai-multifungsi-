import React, { useState } from 'react';
import { generateText } from '../../services/geminiService';

const Eli5Explainer: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setExplanation('');

    try {
      const systemInstruction = "Explain the following topic to me as if I were 5 years old. Use simple language, short sentences, and relatable analogies. Avoid jargon and complex concepts. The goal is to make it incredibly easy to understand.";
      const result = await generateText(topic, systemInstruction);
      setExplanation(result);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 md:p-6 shadow-2xl shadow-black/20">
      <div className="flex-shrink-0 mb-4">
        <h2 className="text-xl font-bold text-white">ELI5 Explainer</h2>
        <p className="text-sm text-zinc-400">Menjelaskan topik rumit dengan bahasa sederhana.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-4">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-zinc-300 mb-2">
            Topik yang ingin dijelaskan
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
            placeholder="Contoh: Black Hole, Blockchain, Photosynthesis"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Thinking...
            </>
          ) : "Explain Like I'm 5"}
        </button>
      </form>
      
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 min-h-[200px] text-zinc-300 whitespace-pre-wrap leading-relaxed">
          {isLoading && <p className="text-zinc-500 animate-pulse">Simplifying the complex...</p>}
          {error && <p className="text-red-400">{error}</p>}
          {explanation}
        </div>
      </div>
    </div>
  );
};

export default Eli5Explainer;
