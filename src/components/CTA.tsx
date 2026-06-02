import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, CheckCircle2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const MANIFESTO = `# The Neural+Bites Manifesto

We believe food is the original interface between humans and the world — and that the next frontier of health is decoding it in real time.

1. Every meal is data. Every nutrient is a signal.
2. AI vision should empower eaters, not surveil them.
3. Personalized nutrition belongs to everyone, not just elite athletes.
4. Transparent sourcing and open ingredient data are non-negotiable.
5. Food technology must regenerate the planet it feeds.

Join 40,000+ early adopters rewiring how humans relate to food, one ingredient at a time.`;

export const CTA = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [showManifesto, setShowManifesto] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      toast.error("Enter a valid email");
      return;
    }
    setLoading(true);
    try {
      const list = JSON.parse(localStorage.getItem("nb_early_access") || "[]");
      if (!list.includes(trimmed)) list.push(trimmed);
      localStorage.setItem("nb_early_access", JSON.stringify(list));
      await new Promise((r) => setTimeout(r, 600));
      setJoined(true);
      toast.success("You're on the list — welcome to the singularity.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <section id="early-access" className="py-24">
    <div className="container mx-auto px-4">
      <div className="relative overflow-hidden glass-strong rounded-3xl p-12 md:p-20 text-center border-glow">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-neural opacity-20 blur-3xl rounded-full" />
        <div className="relative">
          <h2 className="font-display text-4xl md:text-6xl font-bold max-w-3xl mx-auto leading-tight">
            Step into the <span className="text-gradient">edible singularity.</span>
          </h2>
          <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
            Join 40,000+ early adopters rewiring how humans relate to food, one ingredient at a time.
          </p>
          {joined ? (
            <div className="mt-9 inline-flex items-center gap-2 glass rounded-full px-5 py-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-neon" />
              You're on the early access list.
            </div>
          ) : (
            <form onSubmit={submit} className="mt-9 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@futurefood.ai"
                className="bg-input/60 border-primary/30 h-12 text-center sm:text-left"
              />
              <Button type="submit" size="lg" disabled={loading} className="bg-gradient-neural text-primary-foreground font-semibold hover:opacity-90 glow-neon">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Get early access <ArrowRight className="ml-1 h-4 w-4" /></>}
              </Button>
            </form>
          )}
          <div className="mt-4">
            <Button onClick={() => setShowManifesto(true)} size="lg" variant="outline" className="border-primary/40 hover:bg-primary/10">
              Read the manifesto
            </Button>
          </div>
        </div>
      </div>
    </div>

    {showManifesto && (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in"
        onClick={() => setShowManifesto(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="glass-strong border-glow rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-auto p-8 relative"
        >
          <button
            onClick={() => setShowManifesto(false)}
            className="absolute top-4 right-4 glass rounded-full p-2 hover:bg-destructive/20"
            aria-label="Close manifesto"
          >
            <X className="h-4 w-4" />
          </button>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">{MANIFESTO}</pre>
        </div>
      </div>
    )}
  </section>
  );
};