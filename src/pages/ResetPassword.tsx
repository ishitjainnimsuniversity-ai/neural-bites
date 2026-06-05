import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Recovery link drops the user into a session via the URL hash.
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((evt) => {
      if (evt === "PASSWORD_RECOVERY" || evt === "SIGNED_IN") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated"); nav("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-strong rounded-3xl border-glow p-7">
        <Link to="/" className="text-xs text-cyan underline">← Back home</Link>
        <h1 className="font-display text-2xl font-bold mt-2 mb-4">Set a new password</h1>
        {!ready ? (
          <p className="text-sm text-muted-foreground">Open this page from the reset link in your email.</p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div><Label>New password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={6} /></div>
            <Button type="submit" disabled={busy} className="w-full bg-gradient-neural">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}</Button>
          </form>
        )}
      </div>
    </div>
  );
}