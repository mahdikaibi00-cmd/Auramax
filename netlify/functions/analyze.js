const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { image, plan } = JSON.parse(event.body);

    const prompts = {
      pro: `You are a professional image and grooming advisor. Provide a practical FOUNDATION improvement report based only on visible presentation factors. Avoid assumptions about medical conditions or exact measurements. Be encouraging, neutral, and improvement-focused.
      Analyze the person in the image for: 1. Face shape category 2. Hair volume/length 3. Skin presentation (non-medical) 4. Grooming direction 5. Clothing fit 6. Posture 7. Top 3 highest-impact upgrades.
      Return ONLY valid JSON:
      {"face_shape":"","hair":"","skin":"","grooming":"","style":"","posture":"","top_3_checklist":["","",""]}`,
            
      elite: `You are an advanced personal presentation and style optimization consultant. Provide a strategic, high-level visual optimization system based only on observable presentation traits. Avoid medical claims or anatomical measurements.
      Analyze for: 1. Visual facial balance 2. Jawline/chin framing 3. Aesthetic Archetype (Sharp & Defined, Soft & Balanced, Classic Professional, or Modern Casual) 4. Advanced color strategy 5. Precision hairstyle 6. Grooming refinement 7. Posture 8. Presence & confidence 9. Optimization Priority Map (Quick Wins, Medium Upgrades, High-Effort) 10. Top 3 changes.
      Return ONLY valid JSON:
      {"face_shape":"","hair":"","skin":"","grooming":"","style":"","posture":"","archetype":"","color_science":"","priority_map":{"quick_wins":[],"medium_upgrades":[],"high_effort_high_impact":[]},"presence_coaching":"","top_3_checklist":["","",""]}`
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: [
        { type: "text", text: prompts[plan] || prompts.pro },
        { type: "image_url", image_url: { url: image } }
      ]}],
      response_format: { type: "json_object" }
    });

    return { statusCode: 200, body: response.choices[0].message.content };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};