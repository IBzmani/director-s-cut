
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VisualManifest } from "../types";

/**
 * Converts a remote image URL or a data URL to a base64 string that the Gemini API can process.
 */
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
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve({ data: base64String, mimeType: blob.type });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to convert image to base64:", error);
    return { data: "", mimeType: "image/png" };
  }
}

/**
 * Manuscript Parser: Chunks manuscripts and extracts a unified Visual Manifest.
 */
export const analyzeManuscriptDeep = async (manuscript: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Simple chunking logic: split by double newlines or large blocks
  const chunks = manuscript.match(/[\s\S]{1,8000}(\n\n|$)/g) || [manuscript];
  
  // For the purpose of the manifest, we'll process the most relevant chunks or aggregate
  // In a full implementation, we'd map-reduce this, but here we analyze the first major chunk
  // and prompt the model to be comprehensive.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Act as a world-class production designer. Analyze this manuscript chunk and extract a 'Visual Manifest' as JSON.
    Focus on character visual traits, environment moods, and recurring motifs. 
    
    Manuscript: ${chunks[0]}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          characters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                role: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          },
          environments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                mood: { type: Type.STRING },
                colors: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          motifs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                icon: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

/**
 * Integrated Scene Suggester: Uses World Bible context to ensure suggested frames are consistent.
 */
export const generateSceneWithBrief = async (script: string, manifest: VisualManifest) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const bibleContext = `World Bible: Characters(${manifest.characters.map(c => c.name).join(',')}), Envs(${manifest.environments.map(e => e.name).join(',')})`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze this scene using the ${bibleContext}. Suggest 4-6 visual frames. For each frame, provide:
    1. A storyboard prompt that adheres to the manifest descriptions.
    2. The exact script text segment it maps to.
    3. A 'Director's Brief' (Emotional Arc, Lighting, Camera Logic).
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
                directorsBrief: {
                  type: Type.OBJECT,
                  properties: {
                    emotionalArc: { type: Type.STRING },
                    lightingScheme: { type: Type.STRING },
                    cameraLogic: { type: Type.STRING },
                    pacing: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

/**
 * Spatial Prompting Bridge: Includes coordinate-aware localized edits and manifest validation.
 */
export const generateNanoBananaImage = async (
  prompt: string, 
  manifest: VisualManifest, 
  baseImage?: string,
  clickCoord?: { x: number, y: number }
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const worldBible = `
    WORLD BIBLE VALIDATION:
    Characters: ${manifest.characters.map(c => `${c.name} - ${c.description}`).join('; ')}
    Environment: ${manifest.environments.map(e => `${e.name} (${e.mood}, ${e.colors.join(',')})`).join('; ')}
  `;

  let finalPrompt = `Cinematic storyboard. ${worldBible}. Action: ${prompt}`;
  
  if (clickCoord && baseImage) {
    // Spatial Consistency: Direct the model to a specific region of the image
    finalPrompt = `LOCATED EDIT at coordinates [x:${clickCoord.x}, y:${clickCoord.y}]. Focus refinement here: ${prompt}. Maintain 100% consistency for everything else in the scene.`;
  }

  const parts: any[] = [{ text: finalPrompt }];

  if (baseImage) {
    const imageData = await toBase64(baseImage);
    if (imageData.data) {
      parts.unshift({
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.data
        }
      });
    }
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  return null;
};

/**
 * Emotional Audio Synthesis: Adds metadata tags [whispered], [urgent], etc.
 */
export const generateEmotionalAudio = async (text: string, brief: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Step 1: Director analysis for emotional metadata
  const directiveResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze script segment and brief. Add [metadata tags] like [whispered], [shouted], [urgent], [monotone] inside the text to guide performance.
    Text: "${text}"
    Brief: "${brief}"
    Return only the directed text.`
  });
  
  const directedText = directiveResponse.text || text;

  // Step 2: High-fidelity TTS
  const ttsResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Perform this with high cinematic emotion: ${directedText}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Puck' },
        },
      },
    },
  });

  const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
};
