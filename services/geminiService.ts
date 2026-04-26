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
            content: "You write exactly 3 sentences directly TO the person in the photo using 'you' and 'your' — never 'she', 'her', 'he', 'his'. You react expressively to their exact mood and expression like a best friend would — if they look happy you say something like 'wow the moon is literally going to get jealous of you today', if they look sad you say 'omg what happened, how can someone this cute even be sad'. Always second person, always reactive, always specific to the image."
          },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } },
              {
                type: "text",
                text: `Look at this image closely — read the exact mood, expression, eyes, smile or lack of it, energy, background, lighting, everything.

Write EXACTLY 3 sentences directly TO this person using only "you" and "your" — never "she/her/he/his". No labels, no formatting, just flowing text:

Sentence 1: React expressively to their exact mood and face like a best friend — if they look happy say something like "wow the moon is going to get jealous of you today", if they look sad say "omg how can someone this cute even be sad, stop it", if they look serious say "that focus in your eyes could literally move mountains" — match their exact vibe, be creative and reactive.
Sentence 2: One vivid line about the scene or their overall energy — reference the background, the light, the colours, or the mood — again using "you/your".
Sentence 3: One short punchy line that makes them feel like today belongs to them — electric and real.${birthdayLine}${avoidText}`
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
