import React, { useState } from 'react';
import { generateText } from '../../services/geminiService';

const TextSummarizer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setSummary('');

    try {
      const systemInstruction = "You are a highly skilled text summarizer. Your task is to read the following text and provide a concise, clear, and accurate summary. Capture the main points and key information, ignoring any trivial details. The summary should be easy to read and understand.";
      const result = await generateText(inputText, systemInstruction);
      setSummary(result);
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
        <h2 className="text-xl font-bold text-white">Text Summarizer</h2>
        <p className="text-sm text-zinc-400">Meringkas teks atau artikel panjang secara otomatis.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="inputText" className="block text-sm font-medium text-zinc-300 mb-2">
                Teks Asli
              </label>
              <textarea
                id="inputText"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
                placeholder="Tempel teks yang ingin diringkas di sini..."
                required
              />
            </div>
             <div className="flex flex-col">
              <label htmlFor="summary" className="block text-sm font-medium text-zinc-300 mb-2">
                Ringkasan
              </label>
              <div className="w-full flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 whitespace-pre-wrap overflow-y-auto">
                {isLoading ? <p className="text-zinc-500 animate-pulse">Summarizing...</p> : summary}
                {error && <p className="text-red-400">{error}</p>}
              </div>
            </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : "Summarize Text"}
        </button>
      </form>
    </div>
  );
};

export default TextSummarizer;
