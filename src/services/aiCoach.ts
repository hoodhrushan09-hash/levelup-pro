import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getAICoachAdvice = async (userStats: any, tasks: any[], habits: any[]) => {
  try {
    const prompt = `You are LevelUp Pro's AI Coach. 
    User Stats: ${JSON.stringify(userStats)}
    Current Tasks: ${JSON.stringify(tasks)}
    Current Habits: ${JSON.stringify(habits)}
    
    Provide a short, motivating piece of advice (max 2 sentences) and a "Daily Quest" challenge for today.
    The daily quest should have a specific XP reward (between 50 and 150 XP).
    Return as JSON: { "advice": "...", "dailyQuest": "...", "rewardXP": 100 }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Coach Error:", error);
    return {
      advice: "Keep pushing forward! Consistency is the key to mastery.",
      dailyQuest: "Complete at least 3 tasks today for bonus XP.",
      rewardXP: 50
    };
  }
};
