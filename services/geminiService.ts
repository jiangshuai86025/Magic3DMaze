
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getEncouragement = async (score: number, difficulty: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a very short (max 10 words) encouraging victory message for a child who just finished a 3D maze game. 
      Difficulty: ${difficulty}. Score: ${score}. Be cute and use emojis. Output only the message in Chinese.`,
    });
    return response.text || "太棒了！你是迷宫小能手！🌟";
  } catch (error) {
    console.error("Gemini error:", error);
    return "太棒了！你是迷宫小能手！🌟";
  }
};
