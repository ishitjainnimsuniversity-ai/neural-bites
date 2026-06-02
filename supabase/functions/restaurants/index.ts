import { corsHeaders, callLovableAI } from "../_shared/ai.ts";

const schema = {
  type: "object",
  properties: {
    restaurants: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          cuisine: { type: "string" },
          signature_dish: { type: "string" },
          why_healthy: { type: "string" },
          calories_est: { type: "number" },
          price_range: { type: "string" },
          health_score: { type: "number" },
        },
        required: ["name", "cuisine", "signature_dish", "why_healthy", "health_score"],
      },
    },
  },
  required: ["restaurants"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { city, preference, maxCalories } = await req.json();
    const result = await callLovableAI(
      [
        { role: "system", content: "You suggest realistic healthy restaurant concepts and signature dishes. If a real city is given, mention popular chains/cuisines typical to that area." },
        { role: "user", content: `City: ${city || "any"}. Preference: ${preference || "balanced healthy"}. Max calories per meal: ${maxCalories || 700}. Recommend 5 spots.` },
      ],
      { jsonSchema: schema, jsonName: "recommend" },
    );
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});