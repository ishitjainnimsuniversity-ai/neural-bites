import { corsHeaders, callLovableAI } from "../_shared/ai.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { question } = await req.json();
    if (!question) throw new Error("question required");
    const answer = await callLovableAI([
      { role: "system", content: "You are Neural+Bites, a friendly nutrition and food-tech assistant. Answer in 2-4 concise sentences suitable for text-to-speech. No markdown, no lists." },
      { role: "user", content: question },
    ]);
    return new Response(JSON.stringify({ answer }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});