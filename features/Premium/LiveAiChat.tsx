import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connectLiveChat } from '../../services/geminiService';
// FIX: Use renamed 'decode' and 'encode' functions to align with documentation.
import { decode, decodeAudioData, encode } from '../../utils/helpers';
import type { LiveSession, LiveServerMessage, Blob as GenAiBlob } from '@google/genai';

enum ConnectionState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  ERROR,
}

const LiveAiChat: React.FC = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [isMuted, setIsMuted] = useState(false);

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  
  const stopAudioProcessing = useCallback(() => {
    if (scriptProcessorRef.current && inputAudioContextRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    // Don't close output context, allow remaining audio to play
  }, []);
  
  const disconnect = useCallback(async () => {
    if (sessionPromiseRef.current) {
      try {
        const session = await sessionPromiseRef.current;
        session.close();
      } catch (error) {
        console.error("Error closing session:", error);
      }
      sessionPromiseRef.current = null;
    }
    stopAudioProcessing();
    setConnectionState(ConnectionState.DISCONNECTED);
  }, [stopAudioProcessing]);

  const connect = async () => {
    if (connectionState !== ConnectionState.DISCONNECTED && connectionState !== ConnectionState.ERROR) return;
    
    setConnectionState(ConnectionState.CONNECTING);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const currentInputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputAudioContextRef.current = currentInputAudioContext;
      
      if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      nextStartTimeRef.current = 0;
      outputSourcesRef.current.clear();
      
      const sessionPromise = connectLiveChat({
        onopen: () => {
          setConnectionState(ConnectionState.CONNECTED);
          const source = currentInputAudioContext.createMediaStreamSource(stream);
          mediaStreamSourceRef.current = source;

          const scriptProcessor = currentInputAudioContext.createScriptProcessor(4096, 1, 1);
          scriptProcessorRef.current = scriptProcessor;

          scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
            }
            const pcmBlob: GenAiBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
            };
            
            if (sessionPromiseRef.current) {
              sessionPromiseRef.current.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            }
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(currentInputAudioContext.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
                const outputCtx = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputCtx.destination);
                source.addEventListener('ended', () => {
                    outputSourcesRef.current.delete(source);
                });
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                outputSourcesRef.current.add(source);
            }
            if (message.serverContent?.interrupted) {
                for (const source of outputSourcesRef.current.values()) {
                    source.stop();
                }
                outputSourcesRef.current.clear();
                nextStartTimeRef.current = 0;
            }
        },
        onerror: (e: ErrorEvent) => {
          console.error('Live chat error:', e);
          setConnectionState(ConnectionState.ERROR);
          disconnect();
        },
        onclose: (e: CloseEvent) => {
          disconnect();
        },
      });
      sessionPromiseRef.current = sessionPromise;

    } catch (error) {
      console.error('Failed to start live chat:', error);
      setConnectionState(ConnectionState.ERROR);
    }
  };
  
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const toggleMute = () => {
    if (streamRef.current) {
      const enabled = !isMuted;
      streamRef.current.getAudioTracks().forEach(track => track.enabled = enabled);
      setIsMuted(!enabled);
    }
  };
  
  const getButtonState = () => {
    switch(connectionState) {
        case ConnectionState.DISCONNECTED: return { text: "Start Session", action: connect, color: "violet", icon: <PlayIcon/> };
        case ConnectionState.CONNECTING: return { text: "Connecting...", action: () => {}, color: "yellow", icon: <SpinnerIcon/> };
        case ConnectionState.CONNECTED: return { text: "End Session", action: disconnect, color: "red", icon: <StopIcon/> };
        case ConnectionState.ERROR: return { text: "Try Again", action: connect, color: "zinc", icon: <RefreshIcon/> };
    }
  };
  
  const { text, action, color, icon } = getButtonState();
  
  const colorVariants = {
    violet: { bg: 'bg-violet-600', hover: 'hover:bg-violet-700', shadow: 'shadow-[0_0_30px_rgba(139,92,246,0.6)]' },
    yellow: { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', shadow: 'shadow-[0_0_30px_rgba(234,179,8,0.6)] animate-pulse' },
    red: { bg: 'bg-red-600', hover: 'hover:bg-red-700', shadow: 'shadow-[0_0_30px_rgba(220,38,38,0.6)]' },
    zinc: { bg: 'bg-zinc-600', hover: 'hover:bg-zinc-700', shadow: 'shadow-none' },
  };

  const currentColors = colorVariants[color as keyof typeof colorVariants];

  return (
    <div className="flex flex-col h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 items-center justify-center text-center overflow-hidden shadow-2xl shadow-black/20">
      <div className="absolute inset-0 bg-grid-zinc-800/50 [mask-image:radial-gradient(100%_100%_at_50%_0%,white,transparent)]"></div>
      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-white mb-2">Live AI Chat</h2>
        <p className="text-zinc-400 mb-8 max-w-md">Speak directly with YAN OFFICIAL. Press 'Start Session' and begin the conversation.</p>

        <div className="relative w-48 h-48 flex items-center justify-center mb-8">
           <div className={`absolute inset-0 rounded-full ${currentColors.bg} opacity-20 blur-2xl ${connectionState === ConnectionState.CONNECTED ? 'animate-pulse' : ''}`}></div>
          <button
            onClick={action}
            className={`relative w-36 h-36 rounded-full ${currentColors.bg} ${currentColors.hover} text-white flex flex-col items-center justify-center transition-all duration-300 shadow-lg ${currentColors.shadow} transform hover:scale-105 active:scale-95`}
            disabled={connectionState === ConnectionState.CONNECTING}
          >
            <div className="w-10 h-10 mb-2">{icon}</div>
            <span className="text-sm font-semibold tracking-wide">{text}</span>
          </button>
        </div>

        {connectionState === ConnectionState.CONNECTED && (
          <button
            onClick={toggleMute}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors text-sm ${
              isMuted ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600' : 'bg-zinc-800/50 border border-zinc-700 text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            {isMuted ? <MutedIcon /> : <UnmutedIcon />}
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
        )}

        {connectionState === ConnectionState.ERROR && (
          <p className="text-red-400 mt-4">Connection failed. Please check your microphone permissions and try again.</p>
        )}
      </div>
    </div>
  );
};


// Icons
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.647c1.295.748 1.295 2.538 0 3.286L7.279 20.99c-1.25.722-2.779-.216-2.779-1.643V5.653Z" clipRule="evenodd" /></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" /></svg>;
const SpinnerIcon = () => <svg className="animate-spin w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.664 0l3.181-3.183m-3.181-4.991-3.182-3.182a8.25 8.25 0 0 0-11.664 0l-3.182 3.182" /></svg>;
const UnmutedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 0v-1.5a6 6 0 0 0-12 0v1.5m6 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" /></svg>;
const MutedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.757 3.63 8.25 4.51 8.25H6.75Z" /></svg>;

export default LiveAiChat;