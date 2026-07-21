import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, LogIn, UserPlus, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    onOpenChange(false);
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin, data: { name } },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email to confirm your account.");
    onOpenChange(false);
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Reset link sent. Check your inbox.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md glass-strong border-glow p-7 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold mt-2 mb-1 text-center text-white">
            Neural+Bites Portal
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground text-center mb-4">
            Sync your profile, academy courses and certificates instantly.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
            <TabsTrigger value="reset">Reset</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <form onSubmit={signIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-white">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="bg-black/20 border-white/10 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white">Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className="bg-black/20 border-white/10 text-white" />
              </div>
              <Button type="submit" disabled={busy} className="w-full bg-gradient-neural text-primary-foreground font-semibold">
                {busy ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : <><LogIn className="h-4 w-4 mr-2" />Sign in</>}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={signUp} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-white">Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="bg-black/20 border-white/10 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="bg-black/20 border-white/10 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white">Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className="bg-black/20 border-white/10 text-white" />
              </div>
              <Button type="submit" disabled={busy} className="w-full bg-gradient-neural text-primary-foreground font-semibold">
                {busy ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : <><UserPlus className="h-4 w-4 mr-2" />Create account</>}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="reset">
            <form onSubmit={reset} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-white">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="bg-black/20 border-white/10 text-white" />
              </div>
              <Button type="submit" disabled={busy} className="w-full bg-gradient-neural text-primary-foreground font-semibold">
                {busy ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : <><Mail className="h-4 w-4 mr-2" />Send reset link</>}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
