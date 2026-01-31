
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Converts a remote image URL or a data URL to a base64 string that the Gemini API can process.
 * This fixes the 400 error caused by sending undefined data when baseImage is a standard URL.
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
    // Fallback/Default for placeholders if fetch fails (e.g. CORS)
    return { data: "", mimeType: "image/png" };
  }
}

export const analyzeManuscriptDeep = async (manuscript: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Act as a world-class production designer. Analyze this manuscript and extract a 'Visual Manifest'. 
    Focus on character visual traits, environment moods, and recurring motifs.
    Manuscript: ${manuscript}`,
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

export const generateSceneWithBrief = async (script: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze this scene. Suggest 4 visual frames. For each frame, provide:
    1. A storyboard prompt.
    2. The script paragraph it maps to.
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

export const generateNanoBananaImage = async (prompt: string, baseImage?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts: any[] = [{ text: `Cinematic movie storyboard, ultra-realistic production still. ${prompt}` }];

  if (baseImage) {
    const imageData = await toBase64(baseImage);
    if (imageData.data) {
      parts.unshift({
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.data
        }
      });
      // Adjust the text prompt when an image is provided to guide the edit
      parts[1].text = `Directorial adjustment for this frame: ${prompt}. Maintain cinematic continuity, character likeness, and environment structure.`;
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
