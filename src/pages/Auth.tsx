import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, LogIn, UserPlus, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useSession } from "@/hooks/useSession";

export default function Auth() {
  const nav = useNavigate();
  const { user, loading } = useSession();
  const [tab, setTab] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && user) nav("/"); }, [user, loading, nav]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!"); nav("/");
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin, data: { name } },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email to confirm your account.");
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Reset link sent. Check your inbox.");
  };

  const google = async () => {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) { toast.error(String((res.error as any)?.message ?? res.error)); setBusy(false); return; }
    if ((res as any).redirected) return;
    nav("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-strong rounded-3xl border-glow p-7">
        <Link to="/" className="text-xs text-cyan underline">← Back home</Link>
        <h1 className="font-display text-2xl font-bold mt-2 mb-1">Sign in to Neural+Bites</h1>
        <p className="text-sm text-muted-foreground mb-5">Sync your profile, course progress and certificates across all your devices.</p>

        <Button onClick={google} disabled={busy} variant="outline" className="w-full mb-4">
          <svg viewBox="0 0 48 48" className="h-4 w-4 mr-2"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 8 3l5.7-5.7C33.7 6 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 18.9 13 24 13c3 0 5.8 1.1 8 3l5.7-5.7C33.7 6 29.1 4 24 4 16.3 4 9.6 8.4 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5 0 9.6-1.9 13-5l-6-5c-1.8 1.3-4.2 2-7 2-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.6 39.6 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.3 4.4-4.3 5.8l6 5C40.6 35.2 44 30 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>
          Continue with Google
        </Button>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
            <TabsTrigger value="reset">Reset</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form onSubmit={signIn} className="space-y-3 mt-3">
              <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
              <Button type="submit" disabled={busy} className="w-full bg-gradient-neural">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><LogIn className="h-4 w-4 mr-2" />Sign in</>}</Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={signUp} className="space-y-3 mt-3">
              <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></div>
              <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
              <Button type="submit" disabled={busy} className="w-full bg-gradient-neural">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="h-4 w-4 mr-2" />Create account</>}</Button>
            </form>
          </TabsContent>
          <TabsContent value="reset">
            <form onSubmit={reset} className="space-y-3 mt-3">
              <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <Button type="submit" disabled={busy} className="w-full bg-gradient-neural">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Mail className="h-4 w-4 mr-2" />Send reset link</>}</Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}