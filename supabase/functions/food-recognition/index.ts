import { corsHeaders, callLovableAI } from "../_shared/ai.ts";

const schema = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          confidence: { type: "number" },
          serving_g: { type: "number" },
          calories: { type: "number" },
          protein_g: { type: "number" },
          carbs_g: { type: "number" },
          fat_g: { type: "number" },
          fiber_g: { type: "number" },
          vitamins: { type: "array", items: { type: "string" } },
          health_notes: { type: "string" },
        },
        required: ["name", "confidence", "calories", "protein_g", "carbs_g", "fat_g"],
      },
    },
    summary: { type: "string" },
    health_score: { type: "number" },
  },
  required: ["items", "summary", "health_score"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) throw new Error("imageBase64 is required");
    const result = await callLovableAI(
      [
        { role: "system", content: "You are a food vision and nutrition expert. Identify visible foods and estimate nutrition per the visible portion. Be concise and realistic." },
        { role: "user", content: [
          { type: "text", text: "Identify foods in this image. Return structured nutrition per item and an overall summary + 0-100 health score." },
          { type: "image_url", image_url: { url: imageBase64 } },
        ] },
      ],
      { jsonSchema: schema, jsonName: "report_foods", model: "google/gemini-2.5-flash" },
    );
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});