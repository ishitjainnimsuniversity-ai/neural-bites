import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTA = () => (
  <section className="py-24">
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
          <div className="mt-9 flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="bg-gradient-neural text-primary-foreground font-semibold hover:opacity-90 glow-neon">
              <a href="#recognition">Get started <ArrowRight className="ml-1 h-4 w-4" /></a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary/40 hover:bg-primary/10">
              <a href="#voice">Ask the AI</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
);