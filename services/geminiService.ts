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
                text: `Look at this image closely. Notice the person's face, eyes, expression, smile, skin, hair, the way the light hits them, their outfit, their energy, the background, the whole vibe.

Now write EXACTLY in this structure — no headers, no labels, just flowing text:

Sentence 1: Describe one specific beautiful thing you see about her face or expression (mention something exact from the image).
Sentence 2: Describe the overall glow, energy or presence she gives off in this moment (reference the light, background or mood).
Sentence 3: One more warm poetic observation about her — her smile, her eyes, her style, or how she carries herself.
Closing line: One short punchy confident line like "Today, the world is yours" or "Everything you want is already on its way to you" — make it feel electric and true.

Be warm, poetic, cheesy and genuine. No bullet points, no labels, no quotes.${avoidText}`
              }
            ]
          }
        ],
        max_tokens: 300,
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
