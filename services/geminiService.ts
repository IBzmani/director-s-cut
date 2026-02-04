
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VisualManifest } from "../types";

/**
 * Robust retry wrapper with exponential backoff to handle 429 (Rate Limit) errors.
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 4): Promise<T> {
  let delay = 1000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error?.message?.includes('429') || error?.status === 429;
      if (isRateLimit && i < maxRetries - 1) {
        console.warn(`Rate limit hit (429). Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 500));
        delay *= 2;
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries reached');
}

function safeJsonParse(text: string | undefined): any {
  if (!text) return {};
  try {
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    const match = text?.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : {};
  }
}

async function toBase64(url: string): Promise<{ data: string, mimeType: string }> {
  if (url.startsWith('data:')) {
    const [header, data] = url.split(',');
    const mimeType = header.split(':')[1].split(';')[0];
    return { data, mimeType };
  }
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve({ data: (reader.result as string).split(',')[1], mimeType: blob.type });
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return { data: "", mimeType: "image/png" };
  }
}

const STYLE_GUIDE = "Aesthetic: High-fidelity cinematic concept art. Professional cinematography, realistic volumetric lighting, deep shadows, sharp digital painting. 8k resolution look.";

export const generateBibleAsset = async (name: string, description: string, type: 'character' | 'environment') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = type === 'character' 
    ? `MASTER CHARACTER PLATE: ${name}. ${description}. Detailed character concept art, neutral background, cinematic design, ${STYLE_GUIDE}` 
    : `WORLD BUILDING PLATE: ${name}. ${description}. Establishing shot showing architecture, textures, and lighting mood for this location. ${STYLE_GUIDE}`;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return part ? `data:image/png;base64,${part.inlineData.data}` : null;
  });
};

export const analyzeManuscriptDeep = async (manuscript: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract visual entities for a production bible.
      Script: ${manuscript}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            characters: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, role: { type: Type.STRING }, description: { type: Type.STRING } } } },
            environments: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, mood: { type: Type.STRING }, colors: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
          }
        }
      }
    });
    return safeJsonParse(response.text);
  });
};

export const generateSceneWithBrief = async (script: string, manifest: VisualManifest) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const charList = manifest.characters.map(c => `${c.name} (ID: ${c.id})`).join(', ');
  const envList = manifest.environments.map(e => `${e.name} (ID: ${e.id})`).join(', ');

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As a Film Director, partition the ENTIRE provided script into a sequence of storyboard frames. 
      
      RULES:
      1. Use the Bible entities: Characters: ${charList}. Locations: ${envList}.
      2. The "scriptSegment" for each frame MUST be the actual original text from the script. 
      3. DO NOT SUMMARIZE or SKIP any part of the script. The sum of all scriptSegments must equal the full input script word-for-word.
      4. For each frame's scriptSegment, you MUST wrap the original text in intense EMOTIONAL PERFORMANCE TAGS like [whispering breathlessly], [shouting in rage], [with cold urgency], [trembling with suppressed fear], or [menacingly quiet].
      5. Example format for scriptSegment: "[weary awe] The skeletal remains of the bridge stretched across the lagoon."
      
      Vary the camera shots (Wide, Close-up, Low Angle, etc.) to match the pacing and tone.
      
      Script to partition: ${script}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            frames: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  prompt: { type: Type.STRING },
                  scriptSegment: { type: Type.STRING },
                  characterId: { type: Type.STRING },
                  environmentId: { type: Type.STRING },
                  shotType: { type: Type.STRING },
                  directorsBrief: { type: Type.OBJECT, properties: { emotionalArc: { type: Type.STRING }, lightingScheme: { type: Type.STRING }, cameraLogic: { type: Type.STRING } } }
                }
              }
            }
          }
        }
      }
    });
    return safeJsonParse(response.text);
  });
};

export const generateNanoBananaImage = async (
  prompt: string, 
  manifest: VisualManifest, 
  references: { charId?: string, envId?: string, shotType?: string, emotion?: string } = {},
  baseImage?: string,
  clickCoord?: { x: number, y: number }
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = [];

  if (references.charId) {
    const char = manifest.characters.find(c => c.id === references.charId);
    if (char?.image && char.image.startsWith('data:')) {
      const b64 = await toBase64(char.image);
      parts.push({ inlineData: { mimeType: b64.mimeType, data: b64.data } });
      parts.push({ text: `CHARACTER IDENTITY: This is ${char.name}. Maintain exact facial features, hairstyle, and costume.` });
    }
  }

  if (references.envId) {
    const env = manifest.environments.find(e => e.id === references.envId);
    if (env?.image && env.image.startsWith('data:')) {
      const b64 = await toBase64(env.image);
      parts.push({ inlineData: { mimeType: b64.mimeType, data: b64.data } });
      parts.push({ text: `VISUAL DNA: Extract the architectural style, lighting temperature, and materials from this world reference. Apply them to the new perspective required by the ${references.shotType || 'shot'}.` });
    }
  }

  if (baseImage) {
    const b64 = await toBase64(baseImage);
    parts.push({ inlineData: { mimeType: b64.mimeType, data: b64.data } });
    if (clickCoord) parts.push({ text: `LOCAL EDIT: Focus the modification at region [x:${clickCoord.x}, y:${clickCoord.y}]. Instruction: ${prompt}` });
  }

  const actionText = `CINEMATIC STORYBOARD: ${references.shotType || ''} showing ${prompt}. 
  EMOTION: ${references.emotion || 'Intense'}. 
  SPATIAL COHERENCE: Place the character deeply within the volume of the environment. Ensure the world's lighting (rim lights, bounce light) is physically reflected on the character's form. 
  ${STYLE_GUIDE}`;
  
  parts.push({ text: actionText });

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return imgPart ? `data:image/png;base64,${imgPart.inlineData.data}` : null;
  });
};

export const generateEmotionalAudio = async (text: string, brief: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const inputPrompt = `Perform the following dialogue as a professional actor. 
  Performance Brief: ${brief}.
  
  Dialogue: ${text}`;

  return withRetry(async () => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: inputPrompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: `PERFORMANCE DIRECTIVE: You are an award-winning voice actor. 
          Your script contains [tags] like [whispering breathlessly] or [shouting]. DO NOT read these tags aloud. 
          Instead, interpret them as cues to radically shift your vocal performance, intensity, and timing. 
          Maintain perfect character immersion. The dialogue provided IS the script to be read.`
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch {
      // Fallback if the advanced TTS fails
      const fallback = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text.replace(/\[.*?\]/g, '') }] }],
        config: { responseModalities: [Modality.AUDIO] }
      });
      return fallback.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    }
  });
};
