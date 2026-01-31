
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateSceneLogic = async (script: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this movie script and suggest 4 cinematic frames for a storyboard. Return the result in JSON format.
    Script: ${script}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          refinedScript: { type: Type.STRING },
          frames: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                timeRange: { type: Type.STRING },
                prompt: { type: Type.STRING },
              },
              required: ["title", "timeRange", "prompt"]
            }
          }
        },
        required: ["refinedScript", "frames"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateFrameImage = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `A cinematic movie frame. ${prompt}. High quality, 4k, professional cinematography.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "1K"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
