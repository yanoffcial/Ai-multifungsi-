import React, { useState } from 'react';
import { analyzeImage } from '../../services/geminiService';
import { fileToBase64 } from '../../utils/helpers';
import { PhotoIcon } from '../../components/icons/FeatureIcons';

const ImageAnalyzer: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAnalysis(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !imageFile || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const imageBase64 = await fileToBase64(imageFile);
      const result = await analyzeImage(prompt, imageBase64, imageFile.type);
      setAnalysis(result);
    } catch (err) {
      setError('Gagal menganalisis gambar. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/20 p-4 md:p-6 space-y-4">
      <div className="flex-shrink-0">
        <h2 className="text-xl font-bold text-white">Image Analyzer</h2>
        <p className="text-sm text-zinc-400">Unggah gambar dan ajukan pertanyaan tentangnya.</p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
        {/* Left Panel: Upload and Prompt */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="flex-1 flex flex-col">
             <label htmlFor="image-upload" className="block text-sm font-medium text-zinc-300 mb-2">
                Gambar
              </label>
              <div className="mt-2 flex-1 flex justify-center items-center rounded-lg border border-dashed border-zinc-700 p-4 hover:border-violet-500 transition-colors">
                <div className="text-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="mx-auto max-h-48 w-auto object-contain rounded-md" />
                  ) : (
                    <PhotoIcon className="mx-auto h-12 w-12 text-zinc-500" />
                  )}
                  <div className="mt-4 flex text-sm leading-6 text-zinc-400">
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer rounded-md bg-transparent font-semibold text-violet-400 focus-within:outline-none hover:text-violet-500"
                    >
                      <span>Upload file</span>
                      <input id="image-upload" name="image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                    </label>
                    <p className="pl-1">atau drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-zinc-500">PNG, JPG, GIF</p>
                </div>
              </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-zinc-300 mb-2">
                Pertanyaan Anda
              </label>
              <textarea
                id="prompt"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
                placeholder="Contoh: Apa saja objek dalam gambar ini? Jelaskan diagram ini."
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !prompt.trim() || !imageFile}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:shadow-none"
            >
              {isLoading ? 'Analyzing...' : "Analyze Image"}
            </button>
          </form>
        </div>

        {/* Right Panel: Analysis Result */}
        <div className="w-full md:w-1/2 flex flex-col">
           <label className="block text-sm font-medium text-zinc-300 mb-2">
            Hasil Analisis
           </label>
            <div className="flex-1 bg-zinc-950/50 rounded-lg p-4 border border-zinc-800 overflow-y-auto whitespace-pre-wrap">
              {isLoading && <p className="text-zinc-500 animate-pulse">Analyzing image...</p>}
              {error && <p className="text-red-400">{error}</p>}
              {analysis}
              {!isLoading && !analysis && (
                <div className="flex items-center justify-center h-full text-center text-zinc-500">
                    <p>Hasil analisis akan muncul di sini</p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;
