const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { image, plan } = JSON.parse(event.body);

    const prompts = {
      pro: `You are a professional image and grooming advisor. Provide a practical FOUNDATION improvement report based only on visible presentation factors. Avoid assumptions about medical conditions or exact measurements. Be encouraging, neutral, and improvement-focused. 
      Analyze: 1. General face shape category 2. Hair volume distribution and ideal length placement 3. Visible skin presentation signals 4. Grooming direction 5. Clothing fit guidance 6. Posture and head positioning 7. The 3 highest-impact visual upgrades.
      Return ONLY valid JSON:
      {
        "face_shape": "",
        "hair": "",
        "skin": "",
        "grooming": "",
        "style": "",
        "posture": "",
        "top_3_checklist": ["", "", ""]
      }`,
            
      elite: `You are an advanced personal presentation and style optimization consultant. Provide a strategic, high-level visual optimization system based only on observable presentation traits. Avoid medical claims or exact anatomical measurements. Focus on styling, grooming, posture, and visual presence.
      Analyze: 1. Visual facial balance 2. Jawline and chin presentation 3. Aesthetic Archetype 4. Advanced color strategy 5. Precision hairstyle strategy 6. Grooming refinement 7. Posture 8. Presence & confidence cues 9. Optimization Priority Map (Quick Wins, Medium, High-Impact) 10. Top 3 most impactful changes.
      Return ONLY valid JSON:
      {
        "face_shape": "",
        "hair": "",
        "skin": "",
        "grooming": "",
        "style": "",
        "posture": "",
        "archetype": "",
        "color_science": "",
        "priority_map": { "quick_wins": [], "medium_upgrades": [], "high_effort_high_impact": [] },
        "presence_coaching": "",
        "top_3_checklist": ["", "", ""]
      }`
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