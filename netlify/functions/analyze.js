exports.handler = async (event) => {
  // 1. Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { image, plan } = JSON.parse(event.body);

    // 2. Define the Prompts (Your Custom System)
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

    // 3. Send to ApiFree (Using Native Fetch - No Library Needed)
    const response = await fetch("https://api.apifree.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "openai/gpt-4o", // Correct model for ApiFree
            messages: [
                { role: "user", content: [
                    { type: "text", text: prompts[plan] || prompts.pro },
                    { type: "image_url", image_url: { url: image } }
                ]}
            ],
            response_format: { type: "json_object" },
            max_tokens: 4096,
            temperature: 1
        })
    });

    // 4. Handle API Errors
    if (!response.ok) {
        const errorText = await response.text();
        console.error("ApiFree Error:", errorText);
        return { statusCode: response.status, body: `API Error: ${errorText}` };
    }

    // 5. Return Success
    const data = await response.json();
    return { 
        statusCode: 200, 
        body: data.choices[0].message.content 
    };

  } catch (error) {
    console.error("Function Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};