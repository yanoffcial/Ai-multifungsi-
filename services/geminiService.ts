import { GoogleGenAI, GenerateContentResponse, Chat, LiveServerMessage, Modality, Type, FunctionDeclaration, GenerateVideosOperation } from "@google/genai";

// This is a placeholder. In a real environment, the API key is set securely.
const API_KEY = (typeof process !== 'undefined' && process.env?.API_KEY) || undefined;

// This function is the single point of truth for getting an authenticated AI client.
// It will throw an error if the API key is not available, which must be handled
// by the calling function.
const getGenAI = () => {
    if (!API_KEY) {
        // This is the error that will be thrown on static hosting platforms.
        throw new Error("AI features are unavailable: API Key is not configured for this environment.");
    }
    // A new instance is created for each call to support features like Video Generation
    // which require a fresh client after API key selection.
    return new GoogleGenAI({ apiKey: API_KEY });
}

// --- NEW ---
// Type definition for grounded search results
export interface GroundedSearchResult {
    text: string;
    sources: { uri: string; title: string; }[];
}

// --- NEW ---
// Type definition for grounded maps results
export interface GroundedMapsResult {
    text: string;
    places: { uri: string; title: string; }[];
}


// Type definition for build artifacts
export interface BuildArtifacts {
    buildLog: string;
    capacitorConfig: string;
    androidManifest: string;
}

// Type definition for Email Header Analysis
export interface EmailAnalysisResult {
    summary: {
        riskLevel: 'Low' | 'Medium' | 'High' | 'Informational';
        verdict: string;
        recommendation: string;
    };
    securityChecks: {
        spf: { result: string; details: string };
        dkim: { result: string; details: string };
        dmarc: { result: string; details: string };
    };
    path: Array<{
        hop: number;
        from: string;
        by: string;
        with: string;
        timestamp: string;
        delay: string;
    }>;
}

// Type definition for Code Review
export interface CodeReviewResult {
    summary: string;
    bugs: string[];
    performance: string[];
    style: string[];
    bestPractices: string[];
}


// --- TEXT GENERATION ---
export const generateText = async (prompt: string, systemInstruction?: string): Promise<string> => {
    const ai = getGenAI();
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
        },
    });
    return response.text;
};

export const generateJson = async <T,>(prompt: string, schema: any, systemInstruction?: string): Promise<T | string> => {
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
}

// --- NEW ---
// Function for Mail Composer
export const generateEmail = async (to: string, from: string, subject: string, tone: string, points: string): Promise<string> => {
    const systemInstruction = "You are a professional communication assistant. Your task is to compose a well-structured and coherent email in Indonesian based on the user's provided points. Adhere strictly to the specified tone. The output should be only the email body, without any extra commentary.";
    const prompt = `
        Tuliskan badan email dengan detail berikut:
        - Untuk: ${to}
        - Dari: ${from}
        - Subjek: ${subject}
        - Gaya Bahasa: ${tone}
        - Poin-poin utama yang harus ada dalam email:
        ${points}

        Harap tulis hanya isi (badan) emailnya saja.
    `;
    return await generateText(prompt, systemInstruction);
};

// --- NEW ---
// Function for Code Refiner
const codeReviewSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A brief, high-level summary of the code quality and key findings."
        },
        bugs: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of potential bugs, logical errors, or edge cases not handled."
        },
        performance: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of suggestions to improve the performance and efficiency of the code."
        },
        style: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of suggestions related to code style, formatting, and readability (e.g., naming conventions)."
        },
        bestPractices: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of suggestions for adhering to language-specific best practices and modern conventions."
        }
    },
    required: ['summary', 'bugs', 'performance', 'style', 'bestPractices']
};

export const reviewCode = async (code: string, language: string): Promise<CodeReviewResult> => {
    const systemInstruction = `You are an expert code reviewer and senior software engineer. Analyze the provided ${language} code snippet. Provide a comprehensive review covering potential bugs, performance optimizations, style improvements, and adherence to best practices. Your feedback must be constructive, clear, and actionable. Populate the JSON schema with your findings. If a category has no findings, return an empty array for it.`;
    const prompt = `Please review the following ${language} code:\n\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\``;
    
    const result = await generateJson<CodeReviewResult>(prompt, codeReviewSchema, systemInstruction);
    if (typeof result === 'string') {
        throw new Error('Failed to review code. AI returned a string instead of JSON.');
    }
    return result;
};


// Function for generating APK build artifacts
const buildArtifactsSchema = {
    type: Type.OBJECT,
    properties: {
        buildLog: {
            type: Type.STRING,
            description: "A realistic, detailed build log simulating the entire APK build process using Capacitor and Gradle, including npm install, build scripts, and native compilation steps."
        },
        capacitorConfig: {
            type: Type.STRING,
            description: "The full and valid JSON content for the 'capacitor.config.json' file, tailored to the project."
        },
        androidManifest: {
            type: Type.STRING,
            description: "The most important additions or modifications for the 'AndroidManifest.xml' file, formatted as a valid XML snippet. Include common permissions like INTERNET."
        }
    },
    required: ['buildLog', 'capacitorConfig', 'androidManifest']
};

export const generateBuildArtifacts = async (appName: string, packageName: string, packageJsonContent: string): Promise<BuildArtifacts> => {
    const systemInstruction = "You are a senior mobile developer and DevOps expert specializing in converting web applications into native mobile apps. Your task is to generate realistic build artifacts for an Android APK using Capacitor based on the user's project details.";
    const prompt = `
        A user wants to package their web project as an Android APK.
        - App Name: "${appName}"
        - Package ID: "${packageName}"
        - 'package.json' content:
        \`\`\`json
        ${packageJsonContent}
        \`\`\`
        
        Based on this information, generate the following artifacts as a single JSON object matching the provided schema:
        1.  'buildLog': A realistic, detailed build log simulating the entire process (npm install, npm run build, npx cap sync, gradle build).
        2.  'capacitorConfig': The complete and valid JSON content for the 'capacitor.config.json' file.
        3.  'androidManifest': The essential XML snippets that need to be added or modified in 'AndroidManifest.xml', particularly for permissions.
    `;
    
    const result = await generateJson<BuildArtifacts>(prompt, buildArtifactsSchema, systemInstruction);
    if (typeof result === 'string') {
        throw new Error('Failed to generate build artifacts. AI returned a string instead of JSON.');
    }
    return result;
};

// Function for analyzing email headers
const emailAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.OBJECT,
            properties: {
                riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Informational'], description: "Overall risk assessment." },
                verdict: { type: Type.STRING, description: "A one-sentence summary of the findings." },
                recommendation: { type: Type.STRING, description: "A brief, actionable recommendation for the user." }
            },
            required: ['riskLevel', 'verdict', 'recommendation']
        },
        securityChecks: {
            type: Type.OBJECT,
            properties: {
                spf: { type: Type.OBJECT, properties: { result: { type: Type.STRING, description: "Result of SPF check (e.g., Pass, Fail, Neutral, Not Found)." }, details: { type: Type.STRING, description: "Brief explanation of the SPF result." } }, required: ['result', 'details'] },
                dkim: { type: Type.OBJECT, properties: { result: { type: Type.STRING, description: "Result of DKIM check (e.g., Pass, Fail, Not Found)." }, details: { type: Type.STRING, description: "Brief explanation of the DKIM result." } }, required: ['result', 'details'] },
                dmarc: { type: Type.OBJECT, properties: { result: { type: Type.STRING, description: "Result of DMARC check (e.g., Pass, Fail, Not Found)." }, details: { type: Type.STRING, description: "Brief explanation of the DMARC result." } }, required: ['result', 'details'] }
            },
            required: ['spf', 'dkim', 'dmarc']
        },
        path: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    hop: { type: Type.INTEGER, description: "The hop number in the path, starting from 1." },
                    from: { type: Type.STRING, description: "The server the email came from (IP or hostname)." },
                    by: { type: Type.STRING, description: "The server that received the email (IP or hostname)." },
                    with: { type: Type.STRING, description: "The protocol used (e.g., ESMTP, SMTP)." },
                    timestamp: { type: Type.STRING, description: "The timestamp of this hop." },
                    delay: { type: Type.STRING, description: "Calculated delay from the previous hop." }
                },
                required: ['hop', 'from', 'by', 'with', 'timestamp', 'delay']
            }
        }
    },
    required: ['summary', 'securityChecks', 'path']
};

export const analyzeEmailHeader = async (header: string): Promise<EmailAnalysisResult> => {
    const systemInstruction = "You are a cybersecurity expert specializing in email analysis. Analyze the provided raw email header and extract key security information. Trace the delivery path from the origin to the final recipient. Populate the JSON schema with your findings. Be precise and technical.";
    const prompt = `Analyze the following email header:\n\n${header}`;

    const result = await generateJson<EmailAnalysisResult>(prompt, emailAnalysisSchema, systemInstruction);
    if (typeof result === 'string') {
        throw new Error('Failed to analyze email header. AI returned a string instead of JSON.');
    }
    return result;
};


// --- NEW ---
// Function for web-grounded generation
export const generateWithGoogleSearch = async (prompt: string): Promise<GroundedSearchResult | string> => {
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
    
    // FIX: Explicitly typed the Map to aid TypeScript's type inference, which was failing
    // to correctly determine the type of the `values()` iterator. This resolves the assignment error.
    const uniqueSources = Array.from(new Map<string, { uri: string; title: string; }>(sources.map(item => [item.uri, item])).values());

    return {
        text: response.text,
        sources: uniqueSources,
    };
};

// --- NEW ---
// Function for maps-grounded generation
export const generateWithGoogleMaps = async (prompt: string, coords?: {latitude: number, longitude: number}): Promise<GroundedMapsResult | string> => {
    const ai = getGenAI();

    const requestConfig: any = {
        tools: [{googleMaps: {}}],
    };

    if (coords) {
        requestConfig.toolConfig = {
            retrievalConfig: {
                latLng: {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                }
            }
        };
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: requestConfig,
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const places = groundingChunks
        .filter((chunk: any): chunk is { maps: { uri: string; title?: string } } => !!chunk?.maps?.uri)
        .map((chunk: { maps: { uri: string; title?: string } }) => ({
            uri: chunk.maps.uri,
            title: chunk.maps.title || 'Untitled Place',
        }));

    const uniquePlaces = Array.from(new Map<string, { uri: string; title: string; }>(places.map(item => [item.uri, item])).values());

    return {
        text: response.text,
        places: uniquePlaces,
    };
};


// --- CHAT ---
// This function is special because it's called synchronously in useEffect.
// We catch the error from getGenAI and return null to prevent crashing the app.
// The component then handles the null case to display an error message.
export const createChat = (systemInstruction?: string): Chat | null => {
    try {
        const ai = getGenAI();
        return ai.chats.create({
            model: 'gemini-2.5-flash', // Lite model for faster chat
            config: {
                systemInstruction: systemInstruction,
            },
        });
    } catch (error) {
        console.error("Failed to create chat session:", error);
        return null;
    }
};

// --- IMAGE GENERATION & ANALYSIS ---
export const generateImages = async (prompt: string, count: number = 3): Promise<string[] | null> => {
    const ai = getGenAI();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: count,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
        },
    });
    return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
};

export const analyzeImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
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
};

export const editImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string | null> => {
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
};

// --- LIVE CHAT (AUDIO) ---
export const connectLiveChat = async (callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => Promise<void>;
    onerror: (e: ErrorEvent) => void;
    onclose: (e: CloseEvent) => void;
}) => {
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
}