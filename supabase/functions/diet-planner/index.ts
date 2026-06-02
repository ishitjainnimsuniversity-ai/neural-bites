import { corsHeaders, callLovableAI } from "../_shared/ai.ts";

const schema = {
  type: "object",
  properties: {
    daily_calories: { type: "number" },
    daily_protein_g: { type: "number" },
    rationale: { type: "string" },
    days: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: { type: "string" },
          meals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                slot: { type: "string" },
                calories: { type: "number" },
                protein_g: { type: "number" },
                ingredients: { type: "array", items: { type: "string" } },
              },
              required: ["name", "slot", "calories", "protein_g", "ingredients"],
            },
          },
        },
        required: ["day", "meals"],
      },
    },
  },
  required: ["daily_calories", "daily_protein_g", "rationale", "days"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { age, gender, weightKg, heightCm, goal, dietStyle, allergies } = await req.json();
    const result = await callLovableAI(
      [
        { role: "system", content: "You are a registered dietitian. Build realistic, varied 3-day meal plans with reasonable nutrition numbers." },
        { role: "user", content: `Create a 3-day meal plan.
Age: ${age}, Gender: ${gender}, Weight: ${weightKg}kg, Height: ${heightCm}cm.
Goal: ${goal}. Diet style: ${dietStyle || "balanced"}. Allergies: ${allergies || "none"}.
Include breakfast, lunch, dinner, snack per day.` },
      ],
      { jsonSchema: schema, jsonName: "make_plan" },
    );
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});