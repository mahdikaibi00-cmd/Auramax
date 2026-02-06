exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { image, plan } = JSON.parse(event.body);

    // --- 1. PROMPTS (Strictly forcing JSON structure since we removed response_format) ---
    const PRO_PROMPT = `
    You are a senior style consultant.
    Tone: Professional, Direct.
    IMPORTANT: You must return ONLY raw JSON. Do not include markdown formatting like \`\`\`json.
    Structure:
    {
      "presentation_score": 7.5,
      "face_shape": { "type": "Oval", "insight": "Balanced" },
      "hair": { "strategy": "Volume up", "avoid": "Flat sides" },
      "skin": { "signals": "Clear", "improvement_direction": "Moisturize" },
      "grooming": { "recommendation": "Clean shave", "maintenance": "Daily" },
      "style_posture": { "style_direction": "Minimalist", "posture_tip": "Shoulders back" },
      "top_3_actions": ["Action A", "Action B", "Action C"],
      "expert_note": "Small changes matter."
    }`;

    const ELITE_PROMPT = `
    You are an elite aesthetic strategist.
    Tone: Premium, Authoritative.
    IMPORTANT: You must return ONLY raw JSON. Do not include markdown formatting like \`\`\`json.
    Structure:
    {
      "optimization_score": 8.2,
      "summary": "Strong potential.",
      "facial_balance": { "insight": "Good symmetry", "enhancement_strategy": "Define jaw" },
      "jawline_strategy": "Reduce sodium",
      "archetype": { "type": "Maverick", "description": "High trust", "optimize_for": "Authority", "avoid": "Slouching" },
      "hairstyle_map": { "length_zones": "Short sides", "volume_strategy": "Upward", "framing": "Clear forehead" },
      "color_science": { "undertone": "Cool", "contrast_level": "High", "best_colors": "Navy", "avoid_colors": "Beige" },
      "style_system": { "cuts": "Tailored", "fabrics": "Wool", "layering": "Yes", "consistency_rule": "3 colors" },
      "presence_coaching": { "eye_contact": "Direct", "smile": "Subtle", "head_position": "Level" },
      "priority_map": { "quick_wins": ["Hair"], "medium_upgrades": ["Skin"], "high_effort_high_impact": ["Gym"] },
      "top_3_actions": ["Action 1", "Action 2", "Action 3"],
      "final_note": "Identity is key."
    }`;

    const systemPrompt = plan === 'elite' ? ELITE_PROMPT : PRO_PROMPT;

    // --- 2. CALL API (Matched to apifree.ai Documentation) ---
    console.log("Sending request to openai/gpt-4o-mini...");

    const response = await fetch("https://api.apifree.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            // FIX 1: Exact model name from docs
            model: "openai/gpt-4o-mini", 
            
            // FIX 2: Removed "response_format" as it is not in the provided Schema
            messages: [
              { role: "user", content: [
                { type: "text", text: systemPrompt + "\n\nAnalyze this image and return the JSON report." },
                { type: "image_url", image_url: { url: image } }
              ]}
            ],
            max_tokens: 4000,
            temperature: 0.7
        })
    });

    // --- 3. ERROR HANDLING ---
    // Handle HTTP errors
    if (!response.ok) {
       const errText = await response.text();
       console.error("API HTTP Error:", errText);
       throw new Error(`Provider HTTP Error: ${response.status} - ${errText}`);
    }
    
    const data = await response.json();

    // FIX 3: Check for "soft" errors (HTTP 200 but contains error object)
    if (data.error) {
        console.error("API Logical Error:", JSON.stringify(data.error));
        throw new Error(`Provider Logic Error: ${data.error.message || JSON.stringify(data.error)}`);
    }
    
    // Validate Data Existence
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("Invalid Data Structure:", JSON.stringify(data));
        throw new Error("AI returned empty or malformed response");
    }

    let content = data.choices[0].message.content;
    
    // Clean Markdown (Safety net since we removed JSON mode)
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();

    return { statusCode: 200, body: content };

  } catch (error) {
    console.error("Backend Failure:", error);
    return { 
        statusCode: 500, 
        body: JSON.stringify({ error: error.message || "Unknown Server Error" }) 
    };
  }
};