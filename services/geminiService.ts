import { GoogleGenAI, GenerateContentResponse, Chat, LiveSession, LiveServerMessage, Modality, Type, FunctionDeclaration, GenerateVideosOperation } from "@google/genai";

// This is a placeholder. In a real environment, the API key is set securely.
const API_KEY = process.env.API_KEY;

const getGenAI = () => {
    if (!API_KEY) {
        console.error("API_KEY is not set in environment variables.");
        // In a real app, you might want to throw an error or handle this more gracefully.
    }
    return new GoogleGenAI({ apiKey: API_KEY });
}

// --- NEW ---
// Type definition for grounded search results
export interface GroundedSearchResult {
    text: string;
    sources: { uri: string; title: string; }[];
}

// --- TEXT GENERATION ---
export const generateText = async (prompt: string, systemInstruction?: string): Promise<string> => {
    try {
        const ai = getGenAI();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating text:", error);
        return "Sorry, I encountered an error while processing your request.";
    }
};

export const generateJson = async <T,>(prompt: string, schema: any, systemInstruction?: string): Promise<T | string> => {
     try {
        const ai = getGenAI();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        return JSON.parse(response.text) as T;
    } catch (error) {
        console.error("Error generating JSON:", error);
        return "Sorry, I encountered an error while processing your request.";
    }
}

// --- NEW ---
// Function for web-grounded generation
export const generateWithGoogleSearch = async (prompt: string): Promise<GroundedSearchResult | string> => {
    try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        // FIX: Refactored source extraction to be more type-safe.
        // This explicitly filters for chunks containing web data and then maps them to the desired format,
        // preventing potential runtime errors and satisfying TypeScript's type checker.
        const sources = groundingChunks
            .filter((chunk: any): chunk is { web: { uri: string; title?: string } } => !!chunk?.web?.uri)
            .map(chunk => ({
                uri: chunk.web.uri,
                title: chunk.web.title || chunk.web.uri,
            }));
        
        const uniqueSources = Array.from(new Map(sources.map(item => [item.uri, item])).values());

        return {
            text: response.text,
            sources: uniqueSources,
        };
    } catch (error) {
        console.error("Error generating with Google Search:", error);
        return "Sorry, I encountered an error while searching the web.";
    }
};


// --- CHAT ---
export const createChat = (systemInstruction?: string): Chat => {
    const ai = getGenAI();
    return ai.chats.create({
        model: 'gemini-2.5-flash', // Lite model for faster chat
        config: {
            systemInstruction: systemInstruction,
        },
    });
};

// --- IMAGE GENERATION & ANALYSIS ---
export const generateImages = async (prompt: string): Promise<string[] | null> => {
    try {
        const ai = getGenAI();
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 3,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });
        return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
    } catch (error) {
        console.error("Error generating images:", error);
        return null;
    }
};

export const analyzeImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    try {
        const ai = getGenAI();
        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: imageBase64,
            },
        };
        const textPart = { text: prompt };
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing image:", error);
        return "Sorry, I couldn't analyze the image.";
    }
};

export const editImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string | null> => {
    try {
        const ai = getGenAI();
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType,
            },
        };
        const textPart = { text: prompt };
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Error editing image:", error);
        return null;
    }
};


// FIX: Added generateVideo and checkVideoOperation to support video generation.
// --- VIDEO GENERATION ---
export const generateVideo = async (prompt: string, imageBase64?: string, mimeType?: string): Promise<GenerateVideosOperation> => {
    const ai = getGenAI();
    
    // The type for this payload is complex, so using 'any' is pragmatic here.
    const requestPayload: any = {
        model: 'veo-3.1-fast-generate-preview',
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9',
        },
    };

    if (prompt) {
        requestPayload.prompt = prompt;
    }

    if (imageBase64 && mimeType) {
        requestPayload.image = {
            imageBytes: imageBase64,
            mimeType: mimeType,
        };
    }

    const operation = await ai.models.generateVideos(requestPayload);
    return operation;
};

export const checkVideoOperation = async (operation: GenerateVideosOperation): Promise<GenerateVideosOperation> => {
    const ai = getGenAI();
    return await ai.operations.getVideosOperation({ operation });
};


// --- AUDIO TRANSCRIPTION ---
export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
    try {
        const ai = getGenAI();
        const audioPart = {
            inlineData: {
                mimeType: mimeType,
                data: audioBase64,
            },
        };
        const textPart = { text: "Transcribe this audio accurately." };
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [audioPart, textPart] },
        });
        return response.text;
    } catch (error) {
        console.error("Error transcribing audio:", error);
        return "Sorry, I couldn't transcribe the audio.";
    }
};

// --- LIVE CHAT (AUDIO) ---
export const connectLiveChat = async (callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => Promise<void>;
    onerror: (e: ErrorEvent) => void;
    onclose: (e: CloseEvent) => void;
}): Promise<LiveSession> => {
    const ai = getGenAI();
    return await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
        },
    });
};

// --- TEXT TO SPEECH ---
export const generateSpeech = async (text: string, voice: string): Promise<string | null> => {
    try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voice },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch(error) {
        console.error("Error generating speech:", error);
        return null;
    }
}