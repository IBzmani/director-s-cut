
import { GoogleGenAI, Type } from "@google/genai";

// Guidelines: Always create a new GoogleGenAI instance right before making an API call 
// to ensure it always uses the most up-to-date API key.

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
  
  // Using gemini-2.5-flash-image as it is a "nano banana" model that doesn't strictly 
  // require the mandatory billing selector for all users like gemini-3-pro-image-preview does.
  const parts: any[] = [{ text: `Cinematic movie storyboard, ultra-realistic production still. ${prompt}` }];

  if (baseImage) {
    parts.unshift({
      inlineData: {
        mimeType: 'image/png',
        data: baseImage.split(',')[1]
      }
    });
    parts[1].text = `Modify this frame following these specific directorial notes: ${prompt}. Keep the scene structure and character identity consistent with the original.`;
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
