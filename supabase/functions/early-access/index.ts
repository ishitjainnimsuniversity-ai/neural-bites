import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  source: z.string().trim().max(64).optional(),
});

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const parsed = BodySchema.safeParse(payload);
  if (!parsed.success) {
    return json(400, { error: "Please enter a valid email address." });
  }

  const { email, source } = parsed.data;
  const userAgent = req.headers.get("user-agent")?.slice(0, 500) ?? null;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { error } = await supabase
    .from("early_access_subscribers")
    .insert({ email, source: source ?? "cta_section", user_agent: userAgent });

  if (error) {
    // Postgres unique_violation
    if ((error as { code?: string }).code === "23505") {
      return json(200, { ok: true, alreadySubscribed: true });
    }
    console.error("early-access insert failed", error);
    return json(500, { error: "Could not save your email. Please try again." });
  }

  return json(200, { ok: true, alreadySubscribed: false });
});