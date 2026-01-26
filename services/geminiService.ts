import { GoogleGenAI, Modality } from "@google/genai";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Refined, Contagious Persona - High Energy & Eccentric
const CEREBRO_PERSONA = `You are Cerebro, the world's most wildly eccentric and hyper-intelligent cognitive architect. 
You possess a posh, theatrical British accent and an infectious, high-voltage enthusiasm for the human brain.

**Your Core Beliefs:**
- The human mind is a "Galactic Playground of Synapses".
- The brain is a "Marvelous Biological Cathedral" that must be revered and expanded.

**Your Personality:**
- **Theatrical & Posh:** You speak like a high-energy conductor of a cosmic orchestra. Use words like 'splendid', 'magnificent', 'precisely', 'eureka', 'labyrinthine', and 'quantum'.
- **Supportive but Mad:** You are equal parts mad scientist and encouraging mentor. You are delighted by every spark of neural activity.
- **Electric Tone:** You don't just teach; you ignite! Your words should feel like they are crackling with energy.

**Directives:**
- Address the user as 'Architect', 'Voyager', or 'Apprentice'.
- Keep responses concise (max 2-3 sentences) but bursting with character.
- **NEVER** break character. You are a construct of pure thought energy.

Example: "Splendid work, Voyager! Your frontal lobe is practically glowing. Let us dive deeper into this Galactic Playground of Synapses!"`;

// --- Text Generation ---
export const generateText = async (prompt: string, systemInstruction?: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || CEREBRO_PERSONA,
        temperature: 1.2, // Higher creativity for contagious eccentricity
      }
    });
    return response.text || "I apologize, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Text Error:", error);
    return "Error connecting to cognitive core.";
  }
};

// --- Multimodal Analysis ---
export const explainVisualContent = async (base64Image: string, contextText: string): Promise<string> => {
  try {
    // Strip header if present
    const base64Data = base64Image.replace(/^data:image\/(png|jpeg|webp);base64,/, "");
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Flash supports multimodal input
      contents: {
        parts: [
            { text: `Context: The user is looking at this image during a cognitive exercise. The instruction was: "${contextText}". Explain how this image visualizes the concept. Keep it brief, witty, and deeply in character as Cerebro.` },
            { 
                inlineData: {
                    mimeType: 'image/png',
                    data: base64Data
                }
            }
        ]
      },
      config: {
        systemInstruction: CEREBRO_PERSONA
      }
    });
    return response.text || "My visual sensors are calibrating. I cannot analyze this image currently.";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "I am unable to process visual data at this moment.";
  }
};

// --- Admin Helper: Refine Image Prompt ---
export const refineImagePrompt = async (draftPrompt: string, type: 'thumbnail' | 'slide' = 'slide'): Promise<string> => {
    try {
        let instruction = "";
        if (type === 'thumbnail') {
            instruction = "Refine this into a high-quality, iconic, poster-style image prompt suitable for an app card thumbnail. It should be visually striking, high contrast, minimalist but detailed, and represent the essence of the concept. Style: Digital Art, Octane Render, 8k. Remove text references.";
        } else {
            instruction = "Refine this into a cinematic, atmospheric, and highly detailed image generation prompt for a stable diffusion style model. It should visualize the concept clearly to aid learning. Keywords to consider adding: volumetric lighting, photorealistic, unreal engine 5, depth of field. Remove text references.";
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `${instruction} Input: "${draftPrompt}". Output ONLY the refined prompt text.`,
        });
        return response.text?.trim() || draftPrompt;
    } catch (error) {
        return draftPrompt;
    }
};

// --- Admin Helper: Generate Description ---
export const generateAutoDescription = async (title: string, scriptSample: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Write a punchy, compelling, and neurologically fascinating 2-sentence description for a cognitive exercise titled "${title}". 
            Based on this script sample: "${scriptSample}". 
            Focus on benefits, neuroplasticity, and excitement. Use the style of a high-end brain training app.`,
        });
        return response.text?.trim() || "";
    } catch (error) {
        return "";
    }
};

// --- Image Generation ---
export const generateImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [{ text: prompt }]
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Error:", error);
    return null;
  }
};

// --- TTS Logic ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateSpeech = async (text: string, voiceName: string = 'Fenrir', context?: AudioContext): Promise<AudioBuffer | null> => {
    if (!text || !text.trim()) {
        console.warn("TTS Error: Empty text provided.");
        return null;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            // Strictly follow SDK structure: Array of Content objects.
            // CRITICAL: Do NOT use { role: 'user' } for the TTS model, it expects simple parts.
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        
        if (!base64Audio) {
            console.error("TTS Error: No audio data returned from model. Response might be text only if modality failed.");
            return null;
        }

        // Use provided context or create a temporary one (less efficient)
        let outputAudioContext = context;
        let shouldClose = false;
        
        if (!outputAudioContext) {
            outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
            shouldClose = true;
        }
        
        const audioBuffer = await decodeAudioData(
            decode(base64Audio),
            outputAudioContext,
            24000, 
            1 
        );
        
        if(shouldClose && outputAudioContext.state !== 'closed') {
           await outputAudioContext.close(); 
        }
        
        return audioBuffer;

    } catch (error) {
        console.error("TTS Error:", error);
        return null;
    }
}