import { corsHeaders, callLovableAI } from "../_shared/ai.ts";

const schema = {
  type: "object",
  properties: {
    recipes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          time_min: { type: "number" },
          difficulty: { type: "string" },
          ingredients: { type: "array", items: { type: "string" } },
          steps: { type: "array", items: { type: "string" } },
          calories: { type: "number" },
          protein_g: { type: "number" },
          carbs_g: { type: "number" },
          fat_g: { type: "number" },
          health_tags: { type: "array", items: { type: "string" } },
        },
        required: ["title", "time_min", "ingredients", "steps", "calories", "protein_g"],
      },
    },
  },
  required: ["recipes"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { ingredients, dietStyle, maxTime } = await req.json();
    const result = await callLovableAI(
      [
        { role: "system", content: "You are a chef + nutritionist. Generate creative healthy recipes from given ingredients." },
        { role: "user", content: `Generate 3 recipes using primarily: ${(ingredients || []).join(", ")}.
Diet: ${dietStyle || "balanced"}. Max time: ${maxTime || 45} min. Include realistic nutrition.` },
      ],
      { jsonSchema: schema, jsonName: "make_recipes" },
    );
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});