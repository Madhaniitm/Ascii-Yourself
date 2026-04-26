import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.CHATBOT_API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const getCheesyness = async (base64Image: string): Promise<string> => {
  try {
    const ai = getClient();
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: "Look at this image and give me ONE crazy, cheesy, funny, specific compliment or pickup line based exactly on what you see. Be creative and hilarious. Just one line, no formatting, no quotes, no labels." }
        ]
      }
    });

    return response.text?.trim() || "You just broke my algorithm with that face.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Error 404: Words cannot describe this level of awesomeness.";
  }
};
