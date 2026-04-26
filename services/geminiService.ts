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
            content: "You are a warm, poetic compliment writer. You describe the person's beauty and presence based on exactly what you see in the image, then close with a powerful confidence-boosting line. Always grounded in specific visual details — expression, light, colors, setting, energy. Never generic."
          },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } },
              {
                type: "text",
                text: `Look at this image deeply — the person's face, expression, eyes, smile, glow, the light falling on them, the background, the overall mood and energy.

Write 2-3 warm poetic sentences: first beautifully describe what you see about this person's appearance and presence (be specific to the image), then end with one short punchy line that makes her feel unstoppable and confident for the rest of the day.

Be cheesy, warm, and genuine. No labels, no formatting, no quotes.${avoidText}`
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
