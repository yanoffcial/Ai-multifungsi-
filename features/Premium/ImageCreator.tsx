import React, { useState } from 'react';
import { generateImages } from '../../services/geminiService';
import { PhotoIcon } from '../../components/icons/FeatureIcons';

const ImageCreator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setImageUrls(null);

    try {
      const result = await generateImages(prompt);
      if (result && result.length > 0) {
        setImageUrls(result);
      } else {
        setError('Gagal membuat gambar. Coba prompt yang berbeda.');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/20 p-4 md:p-6 space-y-4">
      <div className="flex-shrink-0">
        <h2 className="text-xl font-bold text-white">AI Image Generator</h2>
        <p className="text-sm text-zinc-400">Hasilkan 3 gambar unik dari imajinasi Anda.</p>
      </div>

      {/* Control Panel */}
      <div className="flex-shrink-0">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-zinc-300 mb-2 sr-only">
                Deskripsi Gambar
              </label>
              <textarea
                id="prompt"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
                placeholder="Contoh: seekor kucing adu panco sama domba, digital art"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
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
              ) : "Generate"}
            </button>
          </form>
      </div>

      {/* Image Display */}
      <div className="flex-1 bg-zinc-950/50 rounded-lg p-4 border border-zinc-800 overflow-y-auto">
          {isLoading && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="aspect-square bg-zinc-800/50 rounded-lg flex items-center justify-center animate-pulse">
                        <PhotoIcon className="w-12 h-12 text-zinc-700"/>
                    </div>
                ))}
            </div>
          )}
          {!isLoading && imageUrls && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {imageUrls.map((url, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden border border-zinc-700/50 shadow-lg">
                        <img src={url} alt={`AI Image Generator - ${prompt} - ${index + 1}`} className="w-full h-full object-cover animate-in fade-in-0 duration-500" />
                    </div>
                ))}
            </div>
          )}
          {!isLoading && !imageUrls && (
            <div className="flex items-center justify-center h-full text-center text-zinc-500">
                <div>
                    <PhotoIcon className="w-16 h-16 mx-auto" />
                    <p className="mt-2">Gambar Anda akan muncul di sini</p>
                </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default ImageCreator;