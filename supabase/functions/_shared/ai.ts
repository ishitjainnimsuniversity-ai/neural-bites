export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export type ChatMessage = { role: "system" | "user" | "assistant"; content: any };

export async function callLovableAI(
  messages: ChatMessage[],
  opts: { model?: string; jsonSchema?: any; jsonName?: string } = {},
): Promise<any> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");
  const model = opts.model ?? "google/gemini-3-flash-preview";

  const body: any = { model, messages };
  if (opts.jsonSchema) {
    body.tools = [{
      type: "function",
      function: {
        name: opts.jsonName ?? "respond",
        description: "Structured response",
        parameters: opts.jsonSchema,
      },
    }];
    body.tool_choice = { type: "function", function: { name: opts.jsonName ?? "respond" } };
  }

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 429) throw new Error("Rate limit exceeded. Please try again shortly.");
  if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in workspace settings.");
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI gateway error ${res.status}: ${t}`);
  }
  const data = await res.json();
  if (opts.jsonSchema) {
    const tc = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!tc) throw new Error("AI did not return structured output");
    return JSON.parse(tc.function.arguments);
  }
  return data.choices?.[0]?.message?.content ?? "";
}