export const getCheesyness = async (base64Image: string, usedLines: string[] = []): Promise<string> => {
  try {
    const apiKey = process.env.CHATBOT_API_KEY;
    if (!apiKey) throw new Error("API Key not found");

    const base64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    const avoidText = usedLines.length > 0
      ? ` NEVER repeat or say anything close to: "${usedLines.slice(-4).join('" or "')}". Be completely different and more creative!`
      : '';

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } },
              {
                type: "text",
                text: `Look at this person — their expression, gesture, pose, outfit, energy. Write ONE short punchy feel-good line that makes her feel like the most radiant, unstoppable, magical human on the planet. Specific to what you see. Warm, cheesy, electric — the kind that puts a smile on her face all day. Max 12 words. No intros, no labels, no quotes.${avoidText}`
              }
            ]
          }
        ],
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || "You just broke my algorithm with that face.";
  } catch (error) {
    console.error("Groq Error:", error);
    return "Error 404: Words cannot describe this level of awesomeness.";
  }
};
