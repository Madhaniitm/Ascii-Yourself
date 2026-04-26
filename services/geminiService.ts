export const getCheesyness = async (base64Image: string, usedLines: string[] = []): Promise<string> => {
  try {
    const apiKey = process.env.CHATBOT_API_KEY;
    if (!apiKey) throw new Error("API Key not found");

    const base64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    const avoidText = usedLines.length > 0
      ? ` Do NOT repeat or resemble: "${usedLines.slice(-4).join('" / "')}".`
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
            role: "system",
            content: "You are a feel-good compliment generator. You ONLY output one short line. You always base your line on specific visual details you observe — the background, lighting, mood, expression, colors, setting, what the person is doing. Never generic. Always grounded in exactly what you see."
          },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } },
              {
                type: "text",
                text: `Study this image carefully: the background, the lighting, the mood, the colors, the person's expression and energy and what they're doing. Now write ONE punchy cheesy feel-good line that is unmistakably about THIS specific image — reference the setting, vibe, or what you see. Make her feel like the most magical person alive. Max 12 words. Just the line, nothing else.${avoidText}`
              }
            ]
          }
        ],
        max_tokens: 80,
        temperature: 1.0,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || "You just broke my algorithm with that face.";
  } catch (error) {
    console.error("Groq Error:", error);
    return "Error 404: Words cannot describe this level of awesomeness.";
  }
};
