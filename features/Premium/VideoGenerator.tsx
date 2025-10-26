import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateVideo, checkVideoOperation } from '../../services/geminiService';
import { fileToBase64 } from '../../utils/helpers';
import type { GenerateVideosOperation } from '@google/genai';

// Polyfill for window.aistudio
// FIX: Define the AIStudio interface to resolve the type conflict.
// Fix: The AIStudio interface was moved into the `declare global` block to make it a global type.
// This resolves a "Subsequent property declarations must have the same type" error by ensuring a single, global definition for AIStudio when augmenting the Window object.
declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        aistudio?: AIStudio;
    }
}

const LOADING_MESSAGES = [
    "Mengumpulkan foton untuk video Anda...",
    "Mengajari piksel cara menari...",
    "Merangkai adegan sinematik...",
    "Menambahkan sedikit keajaiban digital...",
    "Hampir selesai, sedang proses rendering akhir!",
    "Video Anda sedang dalam perjalanan...",
];

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState<boolean | 'checking' | 'error'>('checking');
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

  const operationRef = useRef<GenerateVideosOperation | null>(null);
  const pollerRef = useRef<number | null>(null);
  const messageIntervalRef = useRef<number | null>(null);
  
  const checkApiKey = useCallback(async () => {
    if (!window.aistudio) {
        setApiKeySelected('error');
        setError("AI Studio environment not detected. This feature may not work correctly.");
        return;
    }
    try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
    } catch (e) {
        console.error("Error checking for API key:", e);
        setApiKeySelected('error');
        setError("Could not verify API key status.");
    }
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  useEffect(() => {
    if (isLoading) {
      messageIntervalRef.current = window.setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = LOADING_MESSAGES.indexOf(prev);
          const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
          return LOADING_MESSAGES[nextIndex];
        });
      }, 4000);
    } else {
      if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    }
    return () => {
      if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    };
  }, [isLoading]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Assume success and optimistically update UI
        setApiKeySelected(true);
        setError(null);
      } catch(e) {
        console.error("Error opening select key dialog", e);
        setError("Failed to open the API key selection dialog.");
      }
    }
  };

  const pollOperation = useCallback(async () => {
      if (!operationRef.current) return;
      
      try {
          const updatedOperation = await checkVideoOperation(operationRef.current);
          operationRef.current = updatedOperation;

          if (updatedOperation.done) {
              if (pollerRef.current) clearInterval(pollerRef.current);
              
              const downloadLink = updatedOperation.response?.generatedVideos?.[0]?.video?.uri;
              if (downloadLink && process.env.API_KEY) {
                  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                  const blob = await response.blob();
                  setGeneratedVideoUrl(URL.createObjectURL(blob));
              } else {
                  setError("Video generated, but failed to retrieve the download link.");
              }
              setIsLoading(false);
          }
      } catch (error) {
          console.error("Error polling video operation:", error);
          if (error instanceof Error && error.message.includes("Requested entity was not found")) {
              setError("API Key error. Please re-select your API key.");
              setApiKeySelected(false);
          } else {
              setError("An error occurred while checking video status.");
          }
          if (pollerRef.current) clearInterval(pollerRef.current);
          setIsLoading(false);
      }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!prompt.trim() && !imageFile) || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);
    operationRef.current = null;
    setLoadingMessage(LOADING_MESSAGES[0]);

    try {
      let imageBase64: string | undefined;
      let mimeType: string | undefined;

      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
        mimeType = imageFile.type;
      }
      
      const initialOperation = await generateVideo(prompt, imageBase64, mimeType);
      operationRef.current = initialOperation;
      pollerRef.current = window.setInterval(pollOperation, 10000);

    } catch (error) {
      console.error("Error generating video:", error);
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
         setError("API Key error. Please re-select your API key.");
         setApiKeySelected(false);
      } else {
        setError("Failed to start video generation. Please try again.");
      }
      setIsLoading(false);
    }
  };

  if (apiKeySelected === 'checking') {
      return <div className="flex items-center justify-center h-full text-zinc-400">Checking API Key...</div>;
  }

  if (!apiKeySelected || apiKeySelected === 'error') {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 text-white">API Key Required</h2>
              <p className="mb-6 text-zinc-400 max-w-md">
                This premium feature requires an API key for billing and quota management.
                <br/><br/>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                    Learn more about billing
                </a>
              </p>
              {error && <p className="text-red-400 mb-4">{error}</p>}
              <button onClick={handleSelectKey} className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                  Select API Key
              </button>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 md:p-6 space-y-4 shadow-2xl shadow-black/20">
      <div className="flex-shrink-0">
        <h2 className="text-xl font-bold text-white">Video Generator</h2>
        <p className="text-sm text-zinc-400">Buat video pendek dari gambar dan teks.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-zinc-300 mb-2">
              Prompt (Opsional jika ada gambar)
            </label>
            <textarea
              id="prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
              placeholder="Contoh: A neon hologram of a cat driving at top speed"
            />
          </div>

          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium text-zinc-300 mb-2">
              Gambar Awal (Opsional)
            </label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-zinc-700 px-6 py-10 hover:border-violet-500 transition-colors">
              <div className="text-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Image preview" className="mx-auto h-32 w-auto object-contain rounded-md" />
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
          
          <button
            type="submit"
            disabled={isLoading || (!prompt.trim() && !imageFile)}
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
            ) : "Generate Video"}
          </button>
        </form>
      </div>

      <div className="flex-shrink-0 pt-4 border-t border-zinc-800">
        <h3 className="text-lg font-semibold mb-2 text-white">Result</h3>
        <div className="w-full aspect-video bg-zinc-950 rounded-lg flex items-center justify-center overflow-hidden border border-zinc-800">
          {isLoading ? (
             <div className="text-center p-4">
                <p className="text-zinc-300 animate-pulse">{loadingMessage}</p>
                <p className="text-sm text-zinc-500 mt-2">(This can take a few minutes)</p>
            </div>
          ) : error ? (
            <p className="text-red-400 p-4">{error}</p>
          ) : generatedVideoUrl ? (
            <video src={generatedVideoUrl} controls autoPlay loop className="w-full h-full object-contain" />
          ) : (
            <p className="text-zinc-500">Your video will appear here</p>
          )}
        </div>
      </div>
    </div>
  );
};

const PhotoIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
);

export default VideoGenerator;