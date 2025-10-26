import React, { useState, useRef } from 'react';
import { transcribeAudio } from '../../services/geminiService';
import { blobToBase64 } from '../../utils/helpers';
import { MicrophoneIcon } from '../../components/icons/FeatureIcons';

type RecordingState = 'idle' | 'recording' | 'processing';

const AudioTranscriber: React.FC = () => {
  const [state, setState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    if (state !== 'idle') return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setState('processing');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          const base64 = await blobToBase64(audioBlob);
          const result = await transcribeAudio(base64, audioBlob.type);
          setTranscript(result);
        } catch (err) {
          setError('Failed to transcribe audio. Please try again.');
          console.error(err);
        } finally {
          setState('idle');
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setState('recording');
      setError(null);
      setTranscript('');
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access in your browser settings.');
      console.error(err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const getButton = () => {
    switch (state) {
      case 'idle':
        return (
          <button onClick={handleStartRecording} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            Start Recording
          </button>
        );
      case 'recording':
        return (
          <button onClick={handleStopRecording} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse">
            Stop Recording
          </button>
        );
      case 'processing':
        return (
          <button disabled className="w-full bg-zinc-800 text-zinc-500 cursor-not-allowed font-bold py-3 px-4 rounded-lg flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Transcribing...
          </button>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 md:p-6 shadow-2xl shadow-black/20">
      <div className="flex-shrink-0 mb-4">
        <h2 className="text-xl font-bold text-white">Audio Transcriber</h2>
        <p className="text-sm text-zinc-400">Mengubah rekaman suara menjadi teks secara otomatis.</p>
      </div>
      
      <div className="flex-shrink-0 mb-4">{getButton()}</div>
      
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 min-h-[200px] text-zinc-300 whitespace-pre-wrap leading-relaxed">
          {state === 'recording' && (
            <div className="flex items-center text-red-400 animate-pulse">
              <MicrophoneIcon className="w-5 h-5 mr-2" />
              Recording in progress...
            </div>
          )}
          {error && <p className="text-red-400">{error}</p>}
          {transcript}
          {state === 'idle' && !transcript && !error && <p className="text-zinc-500">Your transcript will appear here.</p>}
        </div>
      </div>
    </div>
  );
};

export default AudioTranscriber;
