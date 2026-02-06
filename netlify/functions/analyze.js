exports.handler = async (event) => {
  // 1. Allow only POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { image, plan } = JSON.parse(event.body);
    console.log("Processing Plan:", plan); // Debug Log

    // 2. YOUR EXACT PROMPTS
    const prompts = {
      pro: `You are a senior personal presentation consultant. Deliver a FOUNDATION glow-up report. Tone: Professional, Direct.
      Return ONLY valid JSON. No markdown. Structure:
      {
        "presentation_score": 7.5,
        "summary": "Strong base features, but grooming lacks definition.",
        "face_shape": { "type": "Oval", "insight": "Balanced proportions, versatile styling." },
        "hair": { "strategy": "Increase volume on top", "avoid": "Buzz cuts" },
        "skin": { "signals": "Minor texture", "improvement_direction": "Hydration focus needed" },
        "grooming": { "recommendation": "Heavy Stubble", "maintenance": "Trim every 3 days" },
        "style_posture": { "style_direction": "Structured collars", "posture_tip": "Chin up" },
        "top_3_actions": ["Tighten hair sides", "Start retinol", "Wear stiff fabrics"],
        "expert_note": "Small changes compound quickly."
      }`,
            
      elite: `You are an elite aesthetic strategist. Deliver a DEEP visual optimization report. Tone: Authoritative, Premium.
      Return ONLY valid JSON. No markdown. Structure:
      {
        "optimization_score": 8.2,
        "summary": "High potential. Alignment needed between grooming and structure.",
        "facial_balance": { "insight": "Lower third lacks visual weight", "enhancement_strategy": "Grow beard to widen jaw" },
        "jawline_strategy": "Create angularity through sharp grooming lines.",
        "archetype": { "type": "Modern Casual", "description": "Approachable yet refined.", "optimize_for": "Soft textures", "avoid": "Over-formal suits" },
        "hairstyle_map": { "length_zones": "Short sides, medium top", "volume_strategy": "Vertical lift", "framing": "Keep forehead clear" },
        "color_science": { "undertone": "Cool Winter", "contrast_level": "High Contrast", "best_colors": "Navy, Black", "avoid_colors": "Beige" },
        "style_system": { "cuts": "Slim fit", "fabrics": "Heavy cotton", "layering": "Essential", "consistency_rule": "Always wear a watch" },
        "presence_coaching": { "eye_contact": "Hold 3 seconds", "smile": "Smirk over full smile", "head_position": "Level chin" },
        "priority_map": { "quick_wins": ["Haircut"], "medium_upgrades": ["Skin routine"], "high_effort_high_impact": ["Neck training"] },
        "top_3_actions": ["Fade the sides", "Whitening strips", "Monochrome outfits"],
        "final_note": "Identity alignment is key to automatic confidence."
      }`
    };

    // 3. Call APIFree (Native Fetch)
    const response = await fetch("https://api.apifree.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "openai/gpt-4o",
            messages: [{ role: "user", content: [
                { type: "text", text: prompts[plan] || prompts.pro },
                { type: "image_url", image_url: { url: image } }
            ]}],
            response_format: { type: "json_object" },
            max_tokens: 4096,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const txt = await response.text();
        console.error("API Error:", txt);
        return { statusCode: response.status, body: `API Provider Error: ${txt}` };
    }

    const data = await response.json();
    return { statusCode: 200, body: data.choices[0].message.content };

  } catch (error) {
    console.error("Function Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};