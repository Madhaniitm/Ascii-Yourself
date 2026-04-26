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
                text: `Study this person's photo carefully — their exact facial expression, body language, gesture, pose, what they're wearing, their eyes, smile, vibe, everything specific about THIS moment.

Write ONE single devastatingly cheesy, sweet, romantic, over-the-top compliment or pickup line that is SO specific to exactly what you see it could only be about THIS person in THIS moment. Make it so cheesy it physically hurts. If they're smiling — mention it. If they're making a face — make it about that. If they're wearing something specific — reference it. Make it warm, funny, irresistible.${avoidText}

One line only. No quotes. No labels. No formatting. Pure weapons-grade cheese.`
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
