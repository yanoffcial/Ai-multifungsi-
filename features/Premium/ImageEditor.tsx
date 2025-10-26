import React, { useState } from 'react';
import { editImage } from '../../services/geminiService';
import { fileToBase64 } from '../../utils/helpers';
import { PhotoIcon } from '../../components/icons/FeatureIcons';

const ImageEditor: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setEditedImageUrl(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !originalImageFile || isLoading) return;

    setIsLoading(true);
    setError(null);
    setEditedImageUrl(null);

    try {
      const imageBase64 = await fileToBase64(originalImageFile);
      const result = await editImage(prompt, imageBase64, originalImageFile.type);
      if (result) {
        setEditedImageUrl(result);
      } else {
        setError('Gagal mengedit gambar. Coba prompt yang berbeda.');
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
        <h2 className="text-xl font-bold text-white">AI Image Editor</h2>
        <p className="text-sm text-zinc-400">Unggah dan edit gambar menggunakan perintah teks sederhana.</p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
        {/* Left Panel: Upload and Prompt */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="flex-1 flex flex-col">
             <label htmlFor="image-upload" className="block text-sm font-medium text-zinc-300 mb-2">
                Gambar Asli
              </label>
              <div className="mt-2 flex-1 flex justify-center items-center rounded-lg border border-dashed border-zinc-700 p-4 hover:border-violet-500 transition-colors">
                <div className="text-center">
                  {originalImagePreview ? (
                    <img src={originalImagePreview} alt="Original" className="mx-auto max-h-48 w-auto object-contain rounded-md" />
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
                  </div>
                  <p className="text-xs leading-5 text-zinc-500">PNG, JPG, GIF</p>
                </div>
              </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-zinc-300 mb-2">
                Perintah Edit
              </label>
              <textarea
                id="prompt"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
                placeholder="Contoh: tambahkan kacamata hitam, ubah latar belakang menjadi luar angkasa"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !prompt.trim() || !originalImageFile}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:shadow-none"
            >
              {isLoading ? 'Editing...' : "Edit Image"}
            </button>
          </form>
        </div>

        {/* Right Panel: Edited Image */}
        <div className="w-full md:w-1/2 flex flex-col">
           <label className="block text-sm font-medium text-zinc-300 mb-2">
            Hasil Edit
           </label>
            <div className="flex-1 bg-zinc-950/50 rounded-lg p-4 border border-zinc-800 flex items-center justify-center overflow-hidden">
                {isLoading && <div className="animate-pulse text-zinc-500">Editing your image...</div>}
                {error && <p className="text-red-400 text-center">{error}</p>}
                {editedImageUrl && !isLoading && (
                    <img src={editedImageUrl} alt="Edited" className="w-full h-full object-contain animate-in fade-in-0" />
                )}
                {!isLoading && !editedImageUrl && !error && (
                    <div className="text-center text-zinc-500">
                        <p>Hasil editan akan muncul di sini</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
