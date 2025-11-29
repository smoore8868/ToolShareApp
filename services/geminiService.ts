import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

interface ToolAnalysis {
  name: string;
  description: string;
  estimatedPrice: number;
  category: string;
}

export const analyzeToolImage = async (base64Image: string): Promise<ToolAnalysis | null> => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini.");
    return null;
  }

  // Strip prefix if present (e.g., "data:image/jpeg;base64,")
  const cleanBase64 = base64Image.split(',')[1] || base64Image;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          {
            text: "Analyze this image. If it is a tool, provide a name, a brief 1-sentence description, an estimated purchase price in USD, and a category (e.g., Power Tools, Hand Tools, Garden). If not a tool, return nulls."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            estimatedPrice: { type: Type.NUMBER },
            category: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as ToolAnalysis;

  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    return null;
  }
};
