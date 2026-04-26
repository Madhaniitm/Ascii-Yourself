export const getCheesyness = async (base64Image: string, usedLines: string[] = []): Promise<string> => {
  try {
    const apiKey = process.env.CHATBOT_API_KEY;
    if (!apiKey) throw new Error("API Key not found");

    const base64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    const avoidText = usedLines.length > 0
      ? ` Do NOT repeat or resemble: "${usedLines.slice(-4).join('" / "')}".`
      : '';

    const today = new Date();
    const isBirthday = today.getMonth() === 3 && [28, 29, 30].includes(today.getDate()); // April = month 3

    const birthdayLine = isBirthday
      ? '\n\nIMPORTANT: The very last sentence you write must be exactly: "Happy Birthday Thanga Pushpam 🎂"'
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
            content: "You write exactly 4 sentences about a person in a photo — no headers, no labels, no bullet points, just flowing text. You are witty, warm, and specific to what you actually see in the image."
          },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } },
              {
                type: "text",
                text: `Study this image carefully — the person's face, expression, eyes, hair, skin, outfit, the background, the light, the mood, everything.

Write EXACTLY 4 sentences, no more, no less — no labels, no formatting, just flowing text:

Sentence 1 (witty beauty): A clever, witty observation about something specific you see — her face, expression, eyes, or a detail that stands out. Be playfully specific, not generic.
Sentence 2 (witty scene): A witty remark about her overall vibe, energy, or the setting/background — something that makes her smile reading it.
Sentence 3 (positivity boost): A warm, sincere line that makes her feel radiant and capable — specific to her energy in this image.
Sentence 4 (closing boost): A short punchy line that makes her feel like today is her day — electric, confident, real.${birthdayLine}${avoidText}`
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
