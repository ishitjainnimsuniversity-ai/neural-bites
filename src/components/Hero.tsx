import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NeuralBackground } from "./NeuralBackground";
import { MotivationTicker } from "./MotivationTicker";
import heroImg from "@/assets/hero-neural-food.jpg";

export const Hero = () => (
  <section className="relative pt-36 pb-24 overflow-hidden">
    <div className="absolute inset-0 grid-bg opacity-40" />
    <div className="absolute inset-0"><NeuralBackground /></div>
    <div className="container mx-auto px-4 relative">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-in space-y-7">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-neon">
            <Sparkles className="h-3.5 w-3.5" /> Neural intelligence · v3.1
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight">
            Taste the <span className="text-gradient">future</span> of nutrition.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            Neural+Bites fuses computer vision, nutrition science and food technology into a single
            living dashboard. Snap an ingredient, decode every molecule, and unlock health insights
            tuned to your body.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-gradient-neural text-primary-foreground font-semibold hover:opacity-90 glow-neon group">
              <a href="#recognition">Scan an ingredient <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" /></a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary/40 hover:bg-primary/10">
              <a href="#diet">Build my plan</a>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-6 max-w-md">
            {[
              { k: "12K+", v: "Ingredients" },
              { k: "99.2%", v: "Recognition" },
              { k: "47", v: "Biomarkers" },
            ].map((s) => (
              <div key={s.v} className="glass rounded-xl p-3 text-center">
                <div className="font-display text-2xl font-bold text-gradient">{s.k}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative animate-float">
          <div className="absolute -inset-8 bg-gradient-neural opacity-30 blur-3xl rounded-full" />
          <div className="relative glass-strong rounded-3xl p-2 overflow-hidden border-glow">
            <img
              src={heroImg}
              alt="Neural network mapping fresh ingredients"
              width={1536}
              height={1024}
              className="rounded-2xl w-full h-auto"
            />
            <div className="absolute bottom-6 left-6 right-6">
              <MotivationTicker />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);