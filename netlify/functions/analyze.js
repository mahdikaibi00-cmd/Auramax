exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { image, plan } = JSON.parse(event.body);

    // YOUR EXACT NEW PROMPTS
    const prompts = {
      pro: `You are a senior personal presentation and grooming consultant. Your task is to deliver a FOUNDATION glow-up report. Tone: Professional, Supportive, Direct.
      Return ONLY valid JSON with this structure:
      {
        "presentation_score": 7.5,
        "summary": "You have a strong base, but grooming details are holding you back.",
        "face_shape": { "type": "Oval", "insight": "Balanced proportions, versatile for styling." },
        "hair": { "strategy": "Increase volume on top", "avoid": "Buzz cuts" },
        "skin": { "signals": "Minor texture visible", "improvement_direction": "Hydration focus needed" },
        "grooming": { "recommendation": "Heavy Stubble", "maintenance": "Trim every 3 days" },
        "style_posture": { "style_direction": "Structured collars", "posture_tip": "Chin up, shoulders back" },
        "top_3_actions": ["Tighten hair sides", "Start retinol", " wear stiff fabrics"],
        "expert_note": "Small changes compound quickly."
      }`,
            
      elite: `You are an elite aesthetic optimization strategist. Deliver a DEEP, strategic visual optimization report. Tone: Authoritative, Strategic, Premium.
      Return ONLY valid JSON with this structure:
      {
        "optimization_score": 8.2,
        "summary": "High potential. Alignment needed between grooming and facial structure.",
        "facial_balance": { "insight": "Lower third lacks visual weight", "enhancement_strategy": "Grow beard to widen jaw" },
        "jawline_strategy": "Create angularity through sharp grooming lines.",
        "archetype": { "type": "Modern Casual", "description": "Approachable yet refined.", "optimize_for": "Soft textures", "avoid": "Over-formal suits" },
        "hairstyle_map": { "length_zones": "Short sides, medium top", "volume_strategy": "Vertical lift", "framing": "Keep forehead clear" },
        "color_science": { "undertone": "Cool Winter", "contrast_level": "High Contrast", "best_colors": "Navy, Black, Charcoal", "avoid_colors": "Beige, Earth tones" },
        "style_system": { "cuts": "Slim fit", "fabrics": "Heavy cotton", "layering": "Essential", "consistency_rule": "Always wear a watch" },
        "presence_coaching": { "eye_contact": "Hold 3 seconds", "smile": "Smirk over full smile", "head_position": "Level chin" },
        "priority_map": { "quick_wins": ["Haircut"], "medium_upgrades": ["Skin routine"], "high_effort_high_impact": ["Gym/Neck training"] },
        "top_3_actions": ["Fade the sides", "Whitening strips", "Monochrome outfits"],
        "final_note": "Identity alignment is key to automatic confidence."
      }`
    };

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

    if (!response.ok) { throw new Error(`API Error: ${response.statusText}`); }
    const data = await response.json();
    return { statusCode: 200, body: data.choices[0].message.content };

  } catch (error) {
    console.error("Backend Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};