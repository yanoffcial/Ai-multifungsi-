import React, { useState } from 'react';
import { generateText, generateImages } from '../../services/geminiService';
import { PhotoIcon } from '../../components/icons/FeatureIcons';

const GENRES = ['Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Thriller', 'Horror', 'Adventure', 'Comedy'];
const LENGTHS = ['Short Story (≈500 words)', 'Medium Story (≈1500 words)', 'Long Story (≈3000 words)'];

const StoryWriter: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState(GENRES[0]);
  const [length, setLength] = useState(LENGTHS[0]);
  const [story, setStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [generateImage, setGenerateImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading || isImageLoading) return;

    setIsLoading(true);
    setIsImageLoading(false);
    setError(null);
    setStory('');
    setImageUrl(null);

    try {
      const systemInstruction = `You are a master storyteller. Write a captivating story based on the user's prompt. The story should be in the ${genre} genre and be approximately the length of a ${length}. Ensure the story has a clear plot, engaging characters, vivid descriptions, and a satisfying conclusion.`;
      const fullPrompt = `Story Idea: "${prompt}"`;
      const result = await generateText(fullPrompt, systemInstruction);
      setStory(result);
      setIsLoading(false);

      if (generateImage) {
        setIsImageLoading(true);
        const imagePrompt = `An illustration for a ${genre} story about: ${prompt}. Cinematic, vibrant, digital art style.`;
        const imageResult = await generateImages(imagePrompt, 1);
        
        if (imageResult && imageResult.length > 0) {
            setImageUrl(imageResult[0]);
        } else {
            console.error('Image generation failed but story was successful.');
        }
        setIsImageLoading(false);
      }
    } catch (err) {
      setError('An error occurred while writing the story. Please try again.');
      console.error(err);
      setIsLoading(false);
      setIsImageLoading(false);
    }
  };

  const buttonText = () => {
    if (isLoading) return 'Menulis Cerita...';
    if (isImageLoading) return 'Membuat Gambar...';
    return 'Write Story';
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 md:p-6 shadow-2xl shadow-black/20">
      <div className="flex-shrink-0 mb-4">
        <h2 className="text-xl font-bold text-white">Story Writer</h2>
        <p className="text-sm text-zinc-400">Hasilkan cerita pendek atau panjang berdasarkan ide Anda.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-zinc-300 mb-2">
            Ide Cerita Anda
          </label>
          <textarea
            id="prompt"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
            placeholder="Contoh: Seorang detektif di Mars menemukan konspirasi kuno..."
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-zinc-300 mb-2">
              Genre
            </label>
            <select id="genre" value={genre} onChange={e => setGenre(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="length" className="block text-sm font-medium text-zinc-300 mb-2">
              Panjang Cerita
            </label>
            <select id="length" value={length} onChange={e => setLength(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
              {LENGTHS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center">
            <input
            id="generate-image"
            type="checkbox"
            checked={generateImage}
            onChange={(e) => setGenerateImage(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-violet-600 focus:ring-violet-500 focus:ring-offset-zinc-900"
            disabled={isLoading || isImageLoading}
            />
            <label htmlFor="generate-image" className="ml-2 block text-sm text-zinc-300">
            Sertakan gambar ilustrasi
            </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || isImageLoading || !prompt.trim()}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:shadow-none"
        >
          {buttonText()}
        </button>
      </form>
      
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 min-h-[200px] text-zinc-300 whitespace-pre-wrap leading-relaxed space-y-4">
          {isLoading && <p className="text-zinc-500 animate-pulse">Cerita sedang dirangkai...</p>}
          {error && <p className="text-red-400">{error}</p>}
          
          {isImageLoading && (
            <div className="aspect-video w-full max-w-md mx-auto bg-zinc-800/50 rounded-lg flex items-center justify-center animate-pulse">
                <div className="text-center text-zinc-500">
                    <PhotoIcon className="w-12 h-12 text-zinc-700 mx-auto"/>
                    <p className="mt-2">Membuat ilustrasi...</p>
                </div>
            </div>
          )}

          {imageUrl && (
            <div className="rounded-lg overflow-hidden border border-zinc-700/50 shadow-lg max-w-md mx-auto">
                <img src={imageUrl} alt={`Illustration for: ${prompt}`} className="w-full h-auto object-contain" />
            </div>
          )}
          
          {story && <p>{story}</p>}
        </div>
      </div>
    </div>
  );
};

export default StoryWriter;