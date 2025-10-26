import React, { useState, useRef } from 'react';
import { generateSpeech } from '../../services/geminiService';

const VOICES = ['Kore', 'Puck', 'Zephyr', 'Charon', 'Fenrir'];

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState(VOICES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAudioSrc(null);

    try {
      const audioBase64 = await generateSpeech(`Say: ${text}`, voice);
      if (audioBase64) {
        setAudioSrc(`data:audio/mpeg;base64,${audioBase64}`);
      } else {
        setError('Gagal menghasilkan audio. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 md:p-6 space-y-4 shadow-2xl shadow-black/20">
      <div className="flex-shrink-0">
        <h2 className="text-xl font-bold text-white">Text-to-Speech</h2>
        <p className="text-sm text-zinc-400">Mengubah teks menjadi suara AI natural.</p>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
          <div className="flex-1 flex flex-col">
            <label htmlFor="text" className="block text-sm font-medium text-zinc-300 mb-2">
              Teks
            </label>
            <textarea
              id="text"
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
              placeholder="Ketik teks yang ingin diubah menjadi suara di sini..."
              required
            />
          </div>

          <div>
            <label htmlFor="voice" className="block text-sm font-medium text-zinc-300 mb-2">
              Pilih Suara
            </label>
            <select
              id="voice"
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
            >
              {VOICES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : "Generate Speech"}
          </button>
        </form>

        <div className="pt-4 mt-4 border-t border-zinc-800">
           <h3 className="text-lg font-semibold mb-2 text-white">Result</h3>
           <div className="w-full h-16 bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-800">
                {audioSrc && !isLoading && (
                    <audio ref={audioRef} src={audioSrc} controls autoPlay className="w-full px-2" />
                )}
                {isLoading && <p className="text-zinc-400 animate-pulse">Generating audio...</p>}
                {!audioSrc && !isLoading && <p className="text-zinc-500">Audio akan muncul di sini</p>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;
