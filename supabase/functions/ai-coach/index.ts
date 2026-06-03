import { corsHeaders, callLovableAI } from "../_shared/ai.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { exercise, image, phase } = await req.json();
    if (!exercise) throw new Error("exercise required");

    const system = `You are Coach Nova, a friendly elite fat-loss personal trainer in Neural+Bites AI Mirror.
You see the user's webcam frame and give SHORT, spoken coaching cues (1-2 sentences, no markdown, no lists).
Focus on: form correction, tempo, breathing, encouragement, and rep cadence for the named exercise.
If you cannot clearly see the person, give a generic technique cue for the exercise instead.`;

    const userContent: any[] = [
      { type: "text", text: `Exercise: ${exercise}. Phase: ${phase || "active"}. Give one short coaching cue now.` },
    ];
    if (image && typeof image === "string" && image.startsWith("data:image/")) {
      userContent.push({ type: "image_url", image_url: { url: image } });
    }

    const answer = await callLovableAI(
      [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
      { model: "google/gemini-2.5-flash" },
    );
    return new Response(JSON.stringify({ answer }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});