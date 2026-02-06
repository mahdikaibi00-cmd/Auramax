const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { image, plan } = JSON.parse(event.body);

    const prompts = {
      pro: `You are a professional image advisor. Analyze the image for visual presentation (grooming, style, face shape) based on male aesthetic standards. 
      CRITICAL: You MUST return a JSON object. Do not include markdown formatting.
      Analyze:
      1. Aesthetic Score (0-100 based on grooming/harmony)
      2. Percentile (e.g. "Top 20%")
      3. Face Shape
      4. Skin Quality (One word: Clear, Textured, Fair, etc)
      5. Masculinity/Feature Definition (One word: High, Medium, Developing)
      6. Potential Score (Current score + 15)
      7. Three specific, actionable improvements.
      
      Return JSON format:
      {"score":82, "percentile":"Top 25%", "face_shape":"Oval", "skin_quality":"Fair", "masculinity":"Medium", "potential":92, "top_3_checklist":["Grow beard to align jaw","Use moisturizer","Fix posture"]}`,
            
      elite: `You are an elite aesthetic consultant. Analyze the image for maximum visual potential.
      CRITICAL: You MUST return a JSON object. Do not include markdown formatting.
      Analyze:
      1. Aesthetic Score (0-100, be strict)
      2. Percentile
      3. Face Shape
      4. Skin Quality
      5. Masculinity
      6. Potential Score
      7. Priority Action Plan (2 distinct items with titles and descriptions).
      
      Return JSON format:
      {"score":78, "percentile":"Top 30%", "face_shape":"Square", "skin_quality":"Needs Hydration", "masculinity":"High", "potential":95, "priority_actions":[{"title":"Hair Volume","desc":"Sides are too wide. Taper the sides."},{"title":"Skin Routine","desc":"Start Retinol protocol."}]}`
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