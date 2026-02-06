exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { image, plan } = JSON.parse(event.body);

    // --- 1. DEFINE PROMPTS EXACTLY AS REQUESTED ---
    const PRO_PROMPT = `
    You are a senior personal presentation and grooming consultant.
    Your task is to deliver a FOUNDATION glow-up report that provides clarity, confidence, and immediate direction.
    Tone: Professional, Supportive, Clear, Direct, Premium.
    Do NOT mention AI, attractiveness ratings, or medical advice.
    
    Return ONLY valid JSON with this exact structure:
    {
      "presentation_score": number (0–10, one decimal),
      "face_shape": { "type": "String", "insight": "String" },
      "hair": { "strategy": "String", "avoid": "String" },
      "skin": { "signals": "String", "improvement_direction": "String" },
      "grooming": { "recommendation": "String", "maintenance": "String" },
      "style_posture": { "style_direction": "String", "posture_tip": "String" },
      "top_3_actions": ["String", "String", "String"],
      "expert_note": "String"
    }`;

    const ELITE_PROMPT = `
    You are an elite aesthetic optimization strategist specializing in visual presence and confidence signaling.
    You work with high-achievers and deliver system-level upgrades.
    Tone: Authoritative, Strategic, Premium, Precise.
    Avoid medical claims or ratings.
    
    Return ONLY valid JSON with this exact structure:
    {
      "optimization_score": number (0–10, one decimal),
      "facial_balance": { "insight": "String", "enhancement_strategy": "String" },
      "jawline_strategy": "String",
      "archetype": { "type": "String", "description": "String", "optimize_for": "String", "avoid": "String" },
      "hairstyle_map": { "length_zones": "String", "volume_strategy": "String", "framing": "String" },
      "color_science": { "undertone": "String", "contrast_level": "String", "best_colors": "String", "avoid_colors": "String" },
      "style_system": { "cuts": "String", "fabrics": "String", "layering": "String", "consistency_rule": "String" },
      "presence_coaching": { "eye_contact": "String", "smile": "String", "head_position": "String" },
      "priority_map": { "quick_wins": ["String"], "medium_upgrades": ["String"], "high_effort_high_impact": ["String"] },
      "top_3_actions": ["String", "String", "String"],
      "final_note": "String"
    }`;

    // Select Prompt
    const systemPrompt = plan === 'elite' ? ELITE_PROMPT : PRO_PROMPT;

    // --- 2. CALL API ---
    const response = await fetch("https://api.apifree.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o", // Ensure your provider supports this, otherwise use gpt-4-turbo
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: [
                { type: "text", text: "Analyze this image and generate the report JSON." },
                { type: "image_url", image_url: { url: image } }
              ]}
            ],
            response_format: { type: "json_object" },
            max_tokens: 4096,
            temperature: 0.7
        })
    });

    if (!response.ok) {
       const err = await response.text();
       throw new Error(`API Error: ${response.status} - ${err}`);
    }
    
    const data = await response.json();
    let content = data.choices[0].message.content;

    // Clean Markdown if present (Safety net)
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();

    return { statusCode: 200, body: content };

  } catch (error) {
    console.error("Backend Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};