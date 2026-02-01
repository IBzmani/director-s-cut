
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VisualManifest } from "../types";

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

const STYLE_GUIDE = "Aesthetic: High-end cinematic production sketch. Professional cinematography, realistic volumetric lighting, deep shadows, sharp digital painting. 8k resolution look.";

export const generateBibleAsset = async (name: string, description: string, type: 'character' | 'environment') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = type === 'character' 
    ? `MASTER CHARACTER PLATE: ${name}. ${description}. Detailed character concept art, neutral background, cinematic design, ${STYLE_GUIDE}` 
    : `WORLD BUILDING PLATE: ${name}. ${description}. Establishing shot showing architecture, textures, and lighting mood for this location. ${STYLE_GUIDE}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : null;
};

export const analyzeManuscriptDeep = async (manuscript: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
};

export const generateSceneWithBrief = async (script: string, manifest: VisualManifest) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const charList = manifest.characters.map(c => `${c.name} (ID: ${c.id})`).join(', ');
  const envList = manifest.environments.map(e => `${e.name} (ID: ${e.id})`).join(', ');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `As a Director, storyboard this sequence. Use these Bible entities: Characters: ${charList}. Locations: ${envList}.
    Vary the camera shots (Wide, Close-up, Low Angle, etc.) to show different parts of the environment.
    Script: ${script}`,
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
                shotType: { type: Type.STRING, description: "e.g. Extreme Close Up, Medium Shot, Dutch Angle" },
                directorsBrief: { type: Type.OBJECT, properties: { emotionalArc: { type: Type.STRING }, lightingScheme: { type: Type.STRING }, cameraLogic: { type: Type.STRING } } }
              }
            }
          }
        }
      }
    }
  });
  return safeJsonParse(response.text);
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

  // 1. CHARACTER ANCHOR (LIKENESS)
  if (references.charId) {
    const char = manifest.characters.find(c => c.id === references.charId);
    if (char?.image.startsWith('data:')) {
      const b64 = await toBase64(char.image);
      parts.push({ inlineData: { mimeType: b64.mimeType, data: b64.data } });
      parts.push({ text: `IDENTITY: This is ${char.name}. Maintain exact facial features and build.` });
    }
  }

  // 2. WORLD ANCHOR (THEMATIC STYLE, NOT LITERAL BACKGROUND)
  if (references.envId) {
    const env = manifest.environments.find(e => e.id === references.envId);
    if (env?.image.startsWith('data:')) {
      const b64 = await toBase64(env.image);
      parts.push({ inlineData: { mimeType: b64.mimeType, data: b64.data } });
      parts.push({ text: `WORLD IDENTITY: The location is ${env.name}. Use this architecture, materials, and atmospheric lighting style. Reinterpret the perspective to fit the ${references.shotType || 'shot'}.` });
    }
  }

  // 3. EDIT CONTEXT
  if (baseImage) {
    const b64 = await toBase64(baseImage);
    parts.push({ inlineData: { mimeType: b64.mimeType, data: b64.data } });
    if (clickCoord) parts.push({ text: `PAINTOVER: Update the region at [x:${clickCoord.x}, y:${clickCoord.y}]. Instruction: ${prompt}` });
  }

  // 4. THE ACTION & INTEGRATION
  const actionText = `CINEMATIC SHOT: ${references.shotType || ''} of ${prompt}. 
  EMOTIONAL TONE: ${references.emotion || 'Dramatic'}. 
  INTEGRATION: Character MUST be physically in the space, with the environment's lighting reflected on their surfaces. 
  ${STYLE_GUIDE}`;
  
  parts.push({ text: actionText });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: { imageConfig: { aspectRatio: "16:9" } }
  });

  const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return imgPart ? `data:image/png;base64,${imgPart.inlineData.data}` : null;
};

export const generateEmotionalAudio = async (text: string, brief: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const cleanedText = text.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim();
  if (!cleanedText) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: cleanedText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
        systemInstruction: `VOICE ACTOR DIRECTIVE: Perform the dialogue with the following emotional intensity: ${brief}. 
        IMPORTANT: Your output will be used for a professional cinematic sequence. Maintain consistent character voice. 
        ONLY speak the dialogue text. DO NOT read parentheticals or metadata.`
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch {
    const fallback = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: cleanedText }] }],
      config: { responseModalities: [Modality.AUDIO] }
    });
    return fallback.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }
};
